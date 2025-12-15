const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend/server');
const Adopter = require('../../backend/src/models/adopter');
const Staff = require('../../backend/src/models/staff');
const Volunteer = require('../../backend/src/models/volunteer');

describe('Auth Integration Tests - Database Insertion', () => {
  let server;

  beforeAll(async () => {
    // Connect to test database
    const testMongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/stray_pets_adoption_test';
    await mongoose.connect(testMongoURI);

    // Start the server for integration testing
    server = app.listen(3001);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (error) {
      console.log('Cleanup error:', error.message);
    }
  });

  describe('Adopter Registration - Database Insertion', () => {
    it('should insert adopter data into database', async () => {
      const adopterData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe.test@example.com',
        phone: '09123456789',
        password: 'password123',
        living_situation: 'own_house',
        pet_experience: 'dogs',
        adopter_consents: ['terms_agreed']
      };

      const response = await request(server)
        .post('/api/auth/register/adopter')
        .send(adopterData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Adopter registered successfully');

      // Verify data was inserted into database
      const adopter = await Adopter.findOne({ email: adopterData.email });

      expect(adopter).toBeTruthy();
      expect(adopter.first_name).toBe('John');
      expect(adopter.last_name).toBe('Doe');
      expect(adopter.email).toBe('john.doe.test@example.com');
      expect(adopter.phone).toBe('09123456789');
    });

    it('should prevent duplicate email registration', async () => {
      const adopterData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith.test@example.com',
        phone: '09123456789',
        password: 'password123',
        living_situation: 'own_house',
        pet_experience: ['dogs'],
        adopter_consents: ['terms_agreed']
      };

      // First registration
      await request(server)
        .post('/api/auth/register/adopter')
        .send(adopterData);

      // Second registration with same email
      const response = await request(server)
        .post('/api/auth/register/adopter')
        .send(adopterData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already registered');
    });
  });

  describe('Staff Registration - Database Insertion', () => {
    it('should insert staff data into database', async () => {
      const staffData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.staff.test@example.com',
        phone: '09123456789',
        password: 'password123',
        consents: ['terms_agreed']
      };

      const response = await request(server)
        .post('/api/auth/register/staff')
        .send(staffData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify data was inserted using the Staff model
      const staffMember = await Staff.findOne({ email: staffData.email });

      expect(staffMember).toBeTruthy();
      expect(staffMember.first_name).toBe('Jane');
      expect(staffMember.last_name).toBe('Smith');
    });
  });

  describe('Volunteer Registration - Database Insertion', () => {
    it('should insert volunteer data into database', async () => {
      const volunteerData = {
        first_name: 'Bob',
        last_name: 'Wilson',
        email: 'bob.volunteer.test@example.com',
        phone: '09123456789',
        password: 'password123',
        availability: ['Weekdays'],
        interested_activities: ['Dog Care'],
        consents: ['terms_agreed']
      };

      const response = await request(server)
        .post('/api/auth/register/volunteer')
        .send(volunteerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify volunteer was inserted using the Volunteer model
      const volunteer = await Volunteer.findOne({ email: volunteerData.email });

      expect(volunteer).toBeTruthy();
      expect(volunteer.first_name).toBe('Bob');
      expect(volunteer.last_name).toBe('Wilson');
      expect(volunteer.availability).toContain('Weekdays');
      expect(volunteer.interested_activities).toContain('Dog Care');
    });
  });

  describe('Login - Database Verification', () => {
    it('should login successfully and return token', async () => {
      // First register a user
      const adopterData = {
        first_name: 'Login',
        last_name: 'Test',
        email: 'login.test@example.com',
        phone: '09123456789',
        password: 'password123',
        living_situation: 'own_house',
        pet_experience: ['dogs'],
        adopter_consents: ['terms_agreed']
      };

      await request(server)
        .post('/api/auth/register/adopter')
        .send(adopterData);

      // Now try to login
      const loginData = {
        email: 'login.test@example.com',
        password: 'password123',
        role: 'adopter'
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login.test@example.com');
      expect(response.body.user.role).toBe('adopter');
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
        role: 'adopter'
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});
