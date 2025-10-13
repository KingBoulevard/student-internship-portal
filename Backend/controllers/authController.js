const Student = require('../models/student');
const Employer = require('../models/employer');
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {

    // 🔐 SMART LOGIN - Automatically detects user type
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                });
            }

            // 🎯 AUTOMATIC USER TYPE DETECTION
            let userType = detectUserType(email);
            
            let user;
            let userModel;

            // Find user based on detected type
            switch (userType) {
                case 'student':
                    userModel = Student;
                    break;
                case 'employer':
                    userModel = Employer;
                    break;
                case 'admin':
                    userModel = Admin;
                    break;
                default:
                    return res.status(400).json({ error: 'Unable to determine user type' });
            }

            // Find user by email
            user = await userModel.findByEmail(email);
            
            // If not found in detected type, other types are tried
            if (!user) {
                const foundUser = await tryAlternativeUserTypes(email, userType);
                if (foundUser) {
                    // Update userType based on where we found the user
                    userType = foundUser.foundType;
                    userModel = getUserModel(userType);
                    user = foundUser;
                }
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check if user is active
            if (user.is_active === false || user.is_active === 0) {
                return res.status(403).json({ error: 'Account is deactivated' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    type: userType,
                    ...(userType === 'employer' && { company: user.company_name }),
                    ...(userType === 'student' && { studentId: user.student_id })
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Prepare safe user data
            const userData = prepareUserData(user, userType);

            res.json({
                message: 'Login successful',
                token,
                user: userData,
                userType
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    // 🔑 SMART REGISTRATION - Automatically determines user type
    register: async (req, res) => {
        try {
            const userData = req.body;
            const { email } = userData;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // 🎯 AUTOMATIC USER TYPE DETECTION
            const userType = detectUserType(email);
            
            // Validate registration data based on user type
            const validationError = validateRegistrationData(userData, userType);
            if (validationError) {
                return res.status(400).json({ error: validationError });
            }

            let userModel = getUserModel(userType);

            // Check if user already exists in ANY user table
            const existingUser = await findUserAcrossAllTypes(email);
            if (existingUser) {
                return res.status(400).json({ 
                    error: 'User already exists with this email',
                    existingUserType: existingUser.type 
                });
            }

            // Add automatic identifiers based on user type
            const enhancedUserData = enhanceUserData(userData, userType, email);

            // Create new user
            const userId = await userModel.create(enhancedUserData);

            res.status(201).json({
                message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
                id: userId,
                userType
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    // 👤 GET CURRENT USER PROFILE
    getProfile: async (req, res) => {
        try {
            const { type, id, email } = req.user; // From JWT token

            const userModel = getUserModel(type);
            const user = await userModel.getByIdSafe(id);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                ...user,
                userType: type
            });

        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    // 🔄 UPDATE PROFILE
    updateProfile: async (req, res) => {
        try {
            const { type, id } = req.user;
            const updateData = req.body;

            const userModel = getUserModel(type);

            // Don't allow password update via this endpoint
            if (updateData.password) {
                return res.status(400).json({ error: 'Use change password endpoint for password updates' });
            }

            // For now, return success - implement actual update later
            const result = await userModel.update(id, updateData);
            if (result === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ 
                message: 'Profile updated successfully',
                userType: type,
                updatedFields: Object.keys(updateData)
            });

        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ error: 'Profile update failed' });
        }
    },

    // 🔐 CHANGE PASSWORD
    changePassword: async (req, res) => {
        try {
            const { type, id } = req.user;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current and new password are required' });
            }

            const userModel = getUserModel(type);

            // Get user with password
            const user = await userModel.findByIdWithPassword(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Update to new password
            await userModel.updatePassword(id, newPassword);

            res.json({ message: 'Password updated successfully' });

        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({ error: 'Password change failed' });
        }
    },

    // 🎫 VERIFY TOKEN
    verifyToken: async (req, res) => {
        try {
            // If middleware passes, token is valid
            res.json({ 
                valid: true, 
                user: req.user 
            });
        } catch (error) {
            res.status(401).json({ valid: false, error: 'Invalid token' });
        }
    }

};

// 🎯 HELPER FUNCTIONS

/**
 * Detects user type based on email domain and other identifiers
 */
function detectUserType(email) {
    if (!email.includes('@')) return 'employer'; // Invalid email
    const emailDomain = email.toLowerCase().split('@')[1];
    
    // University student emails (customize for your university)
    const studentDomains = [
        'unza.zm',
        'cs.unza.zm',
        // Add your actual university email domains
    ];
    
    // Admin identifiers (department emails or special patterns)
    const adminDomains = [
        'admin.university.edu',
        'it.university.edu',
        'careers.university.edu',
        'internship.university.edu'
    ];
    
    // Check for student domains
    if (studentDomains.includes(emailDomain)) {
    return 'student';
  }
    
    // Check for admin domains
    if (adminDomains.includes(emailDomain)) {
    return 'admin';
  }
    
    // Check for admin registration keys (in registration data)
    if (email.includes('+admin') || email.includes('.admin')) {
        return 'admin';
    }
    
    // Default to employer for all other emails
    return 'employer';
}

/**
 * Tries to find user in alternative user tables if primary detection fails
 */
async function tryAlternativeUserTypes(email, originalType) {
    const userTypes = ['student', 'employer', 'admin'];
    
    for (const type of userTypes) {
        if (type !== originalType) {
            const userModel = getUserModel(type);
            const user = await userModel.findByEmail(email);
            if (user) {
                user.foundType = type; // Mark where we found it
                return user;
            }
        }
    }
    return null;
}

/**
 * Validates registration data based on user type
 */
function validateRegistrationData(userData, userType) {
    const requiredFields = {
        student: ['name', 'email', 'password', 'major'],
        employer: ['company_name', 'email', 'password', 'industry'],
        admin: ['username', 'email', 'password', 'department_key']
    };
    
    const fields = requiredFields[userType] || [];
    const missingFields = fields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
        return `Missing required fields for ${userType}: ${missingFields.join(', ')}`;
    }
    
    // Additional validation for admin registration key
    if (userType === 'admin') {
        const validAdminKeys = ['UNI_ADMIN_2024', 'CS_DEPT_KEY', 'INTERNSHIP_ADMIN'];
        if (!validAdminKeys.includes(userData.department_key)) {
            return 'Invalid department registration key';
        }
    }
    
    return null;
}

/**
 * Enhances user data with automatic identifiers
 */
function enhanceUserData(userData, userType, email) {
    const enhanced = { ...userData };
    
    switch (userType) {
        case 'student':
            // Generate student ID automatically
            enhanced.student_id = generateStudentId(email);
            break;
        case 'admin':
            // Set admin role based on email pattern
            enhanced.role = email.includes('super.') ? 'super_admin' : 'moderator';
            // Remove department key from stored data (it's only for registration)
            delete enhanced.department_key;
            break;
    }
    
    return enhanced;
}

/**
 * Finds user across all user tables (for duplicate checking)
 */
async function findUserAcrossAllTypes(email) {
    const userTypes = ['student', 'employer', 'admin'];
    
    for (const type of userTypes) {
        const userModel = getUserModel(type);
        const user = await userModel.findByEmail(email);
        if (user) {
            return { ...user, type };
        }
    }
    return null;
}

/**
 * Gets the appropriate model based on user type
 */
function getUserModel(userType) {
    switch (userType) {
        case 'student': return Student;
        case 'employer': return Employer;
        case 'admin': return Admin;
        default: throw new Error(`Unknown user type: ${userType}`);
    }
}

/**
 * Prepares user data for response (removes sensitive info)
 */
function prepareUserData(user, userType) {
    const baseData = {
        id: user.id,
        email: user.email
    };
    
    switch (userType) {
        case 'student':
            return {
                ...baseData,
                name: user.name,
                major: user.major,
                student_id: user.student_id
            };
        case 'employer':
            return {
                ...baseData,
                company_name: user.company_name,
                industry: user.industry,
                is_verified: user.is_verified
            };
        case 'admin':
            return {
                ...baseData,
                username: user.username,
                role: user.role
            };
    }
}

/**
 * Generates a student ID based on email and timestamp
 */
function generateStudentId(email) {
    const prefix = 'STU';
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${year}${random}`;
}

module.exports = authController;