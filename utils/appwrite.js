import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'linkedin_agent_db';

// Collection IDs
const COLLECTIONS = {
  PROFILES: 'profiles',
  CAMPAIGNS: 'campaigns',
  EVENTS: 'events',
  CONVERSIONS: 'conversions',
  FOCUS: 'focus',
  PRODUCTS: 'products',
  AUDIENCES: 'audiences',
  OFFERS: 'offers',
  AUTOMATION_RULES: 'automation_rules',
};

// Initialize database and collections
export async function initializeAppwrite() {
  try {
    console.log('🔧 Initializing Appwrite...');

    // Create database if it doesn't exist
    try {
      await databases.get(DATABASE_ID);
      console.log('✓ Database exists');
    } catch (e) {
      console.log('📦 Creating database...');
      await databases.create(DATABASE_ID, 'LinkedIn Agent DB');
      console.log('✓ Database created');
    }

    // Create collections if they don't exist
    for (const [key, collectionId] of Object.entries(COLLECTIONS)) {
      try {
        await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`✓ Collection '${collectionId}' exists`);
      } catch (e) {
        console.log(`📋 Creating collection '${collectionId}'...`);
        await createCollection(collectionId, key);
      }
    }

    console.log('✅ Appwrite initialized successfully');
  } catch (error) {
    console.error('❌ Appwrite initialization error:', error);
    throw error;
  }
}

async function createCollection(collectionId, collectionType) {
  try {
    const schemas = {
      profiles: [
        { key: 'name', type: 'string', required: true },
        { key: 'title', type: 'string', required: false },
        { key: 'company', type: 'string', required: false },
        { key: 'painPoint', type: 'string', required: false },
        { key: 'icp', type: 'double', required: false },
        { key: 'email', type: 'string', required: false },
        { key: 'linkedin_url', type: 'string', required: false },
        { key: 'twitter_url', type: 'string', required: false },
      ],
      campaigns: [
        { key: 'profileId', type: 'string', required: true },
        { key: 'platform', type: 'string', required: true },
        { key: 'currentStage', type: 'integer', required: true },
        { key: 'status', type: 'string', required: true },
        { key: 'icpScore', type: 'integer', required: false },
        { key: 'messages', type: 'string', required: false }, // JSON stringified
        { key: 'replies', type: 'string', required: false }, // JSON stringified
        { key: 'scheduledMessages', type: 'string', required: false }, // JSON stringified
      ],
      events: [
        { key: 'type', type: 'string', required: true },
        { key: 'profileId', type: 'string', required: false },
        { key: 'campaignId', type: 'string', required: false },
        { key: 'sentiment', type: 'double', required: false },
        { key: 'data', type: 'string', required: false }, // JSON stringified
      ],
      conversions: [
        { key: 'campaignId', type: 'string', required: true },
        { key: 'type', type: 'string', required: true },
        { key: 'dealValue', type: 'double', required: false },
        { key: 'currency', type: 'string', required: true },
        { key: 'daysToConversion', type: 'integer', required: false },
      ],
      focus: [
        { key: 'name', type: 'string', required: true },
        { key: 'objectives', type: 'string', required: false },
        { key: 'productAllocation', type: 'string', required: false },
      ],
      products: [
        { key: 'name', type: 'string', required: true },
        { key: 'icpProfile', type: 'string', required: false },
        { key: 'painPoints', type: 'string', required: false },
      ],
      audiences: [
        { key: 'persona', type: 'string', required: true },
        { key: 'product', type: 'string', required: true },
        { key: 'tone', type: 'string', required: false },
      ],
      offers: [
        { key: 'product', type: 'string', required: true },
        { key: 'price', type: 'double', required: true },
        { key: 'trial', type: 'string', required: false },
      ],
      automation_rules: [
        { key: 'triggerEvent', type: 'string', required: true },
        { key: 'conditions', type: 'string', required: false },
        { key: 'actions', type: 'string', required: false },
      ],
    };

    const schema = schemas[collectionId] || [];
    const collection = await databases.createCollection(
      DATABASE_ID,
      collectionId,
      collectionId.charAt(0).toUpperCase() + collectionId.slice(1)
    );

    // Add attributes
    for (const attr of schema) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            255,
            attr.required
          );
        } else if (attr.type === 'double') {
          await databases.createFloatAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID,
            collectionId,
            attr.key,
            attr.required
          );
        }
      } catch (e) {
        // Attribute might already exist
      }
    }

    console.log(`✓ Collection '${collectionId}' created with schema`);
  } catch (error) {
    console.error(`Error creating collection ${collectionId}:`, error);
  }
}

// Export database and collections for use in routes
export { databases, DATABASE_ID, COLLECTIONS };