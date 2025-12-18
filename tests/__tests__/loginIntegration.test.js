const request = require('supertest');
const mongoose = require('mongoose');
const app =require('../../backend/server');
const Adopter = require('../../backend/src/models/adopter');
const Staff = require('../../backend/src/models/staff');
const Volunteer = require('../../backend/src/models/volunteer');

describe('Login Integration Tests', () => {
    let server;

    // Setup: Connect to a test database and start the server
    beforeAll(async () => {
        const testMongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/stray_pets_adoption_test_login';
        await mongoose.connect(testMongoURI);
        server = app.listen(3002); // Use a different port to avoid conflicts
    });

    // Teardown: Close the server and disconnect from the database
    afterAll(async () => {
        if (server) {
            server.close();
        }
        await mongoose.disconnect();
    });

    // Before each test, clear the database and create test users
    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();

        // Create a test adopter
        await request(server)
            .post('/api/auth/register/adopter')
            .send({
                first_name: 'Test',
                last_name: 'Adopter',
                email: 'adopter@test.com',
                password: 'password123',
                phone: '11111111111'
            });

        // Create a test staff member
        await request(server)
            .post('/api/auth/register/staff')
            .send({
                first_name: 'Test',
                last_name: 'Staff',
                email: 'staff@test.com',
                password: 'password123',
                phone: '22222222222'
            });
        
        // Create a test volunteer
        await request(server)
            .post('/api/auth/register/volunteer')
            .send({
                first_name: 'Test',
                last_name: 'Volunteer',
                email: 'volunteer@test.com',
                password: 'password123',
                phone: '33333333333'
            });
    });

    describe('Successful Logins', () => {
        it('should successfully log in an adopter', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'adopter@test.com', password: 'password123', role: 'adopter' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe('adopter');
            expect(response.body.user.email).toBe('adopter@test.com');
        });

        it('should successfully log in a staff member', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'staff@test.com', password: 'password123', role: 'staff' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe('staff');
            expect(response.body.user.email).toBe('staff@test.com');
        });

        it('should successfully log in a volunteer', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'volunteer@test.com', password: 'password123', role: 'volunteer' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.role).toBe('volunteer');
            expect(response.body.user.email).toBe('volunteer@test.com');
        });
    });

    describe('Failed Logins', () => {
        it('should fail with an incorrect password', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'adopter@test.com', password: 'wrongpassword', role: 'adopter' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid email or password');
        });

        it('should fail with a non-existent email', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'nobody@test.com', password: 'password123', role: 'adopter' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid email or password');
        });

        it('should fail if an adopter tries to log in as staff', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'adopter@test.com', password: 'password123', role: 'staff' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid email or password');
        });

        it('should fail if required fields are missing', async () => {
            // Missing password
            let response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'adopter@test.com', role: 'adopter' });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Password is required');

            // Missing email
            response = await request(server)
                .post('/api/auth/login')
                .send({ password: 'password123', role: 'adopter' });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Email is required');

            // Missing role
            response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'adopter@test.com', password: 'password123' });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Role is required');
        });
    });
});