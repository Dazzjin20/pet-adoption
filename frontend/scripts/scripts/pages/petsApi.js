// This is a mock API file. In a real application, this would make network requests to your backend.

export const mockPets = [ // Export mockPets for potential use in other scripts (e.g., favorites)
    {
        _id: "123",
        pet_name: "Sadness",
        age: "3 years",
        sex: "Male",
        pet_type: "Dog",
        status: "Available",
        vaccinated: true,
        before_image: "/frontend/assets/image/photo/dog-1-before.jpg",
        after_image: "/frontend/assets/image/photo/dog-1-after.jpg",
        location: "Shelter A",
        arrival_date: "2023-11-01",
        weight: "12 kg",
        personality: ["Friendly", "Playful", "Loves walks"],
        about_pet: "Sadness is a cheerful and energetic dog looking for a loving home. He gets along well with other dogs and loves to play fetch. He was found as a stray but has quickly adapted to being around people."
    },
    // Add more mock pets here if needed
];

/**
 * Fetches a single pet by its ID from the mock data.
 * @param {string} petId The ID of the pet to fetch.
 * @returns {Promise<object|null>} A promise that resolves to the pet object or null if not found.
 */
export const fetchPetById = async (petId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const pet = mockPets.find(p => p._id === petId);
    if (pet) {
        return pet; // In an async function, `return` is like `resolve(value)`
    } else {
        // In an async function, `throw` is like `reject(error)`
        throw new Error(`Pet with ID ${petId} not found.`);
    }
};