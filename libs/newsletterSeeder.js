import connectMongo from "./mongo";
import Newsletter from "@/models/Newsletter";
import Lead from "@/models/Lead";

/**
 * Seed the database with mock newsletters and subscribers
 * This is useful for development and testing
 */

const mockNewsletters = [
  {
    title: "☕ Tesla abre planta en México",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "sent",
    content: {
      summary: "Tesla confirma inversión masiva en México. La gigafactory más grande de LATAM comenzará producción en 2025. También: Apple lanza iPhone 16 Pro y Google presenta nuevo modelo Gemini.",
      articles: [
        {
          title: "Tesla anuncia nueva Gigafactory en México",
          summary: "La compañía confirmó inversión de $5B para construir la planta más grande de América Latina. Comenzará producción en 2025.",
          link: "https://example.com/tesla",
          source: "TechCrunch"
        },
        {
          title: "Apple lanza iPhone 16 Pro con IA integrada",
          summary: "Nuevo modelo incluye chip A18 Pro y funciones avanzadas de procesamiento de imágenes con inteligencia artificial.",
          link: "https://example.com/apple",
          source: "The Verge"
        },
        {
          title: "Google Gemini supera a GPT-4 en benchmarks",
          summary: "Nuevo modelo de Google logra mejor rendimiento en tareas de razonamiento y código. Disponible para desarrolladores.",
          link: "https://example.com/google",
          source: "Wired"
        }
      ]
    },
    sentCount: 140000,
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    title: "☕ Airbnb sube precio en su IPO",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: "sent",
    content: {
      summary: "Airbnb aumenta valoración previo a salida pública. También: Notion lanza AI assistant y Microsoft adquiere startup de IA conversacional por $1.3B.",
      articles: [
        {
          title: "Airbnb prepara IPO con valoración de $30B",
          summary: "La compañía planea salir a bolsa en Q1 2024 con un precio de acciones entre $44-50. Fundada en 2008, tiene presencia en 220 países.",
          link: "https://example.com/airbnb",
          source: "Bloomberg"
        },
        {
          title: "Notion lanza AI Assistant para automatizar tareas",
          summary: "Nueva funcionalidad permite crear documentos, resumir contenido y generar templates automáticamente usando IA.",
          link: "https://example.com/notion",
          source: "Product Hunt"
        }
      ]
    },
    sentCount: 139850,
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    title: "☕ Newsletter de prueba - Draft",
    date: new Date(),
    status: "draft",
    content: {
      summary: "Este es un newsletter en borrador que aún no se ha enviado.",
      articles: [
        {
          title: "Artículo de prueba 1",
          summary: "Resumen del artículo de prueba número uno.",
          link: "https://example.com/test1",
          source: "Test Source"
        }
      ]
    },
    sentCount: 0
  }
];

const mockSubscribers = [
  {
    email: "subscriber1@example.com",
    isActive: true,
    source: "landing_page"
  },
  {
    email: "subscriber2@example.com",
    isActive: true,
    source: "referral"
  },
  {
    email: "subscriber3@example.com",
    isActive: false, // unsubscribed
    source: "landing_page"
  }
];

export async function seedDatabase() {
  try {
    await connectMongo();
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Newsletter.deleteMany({});
    console.log("🗑️  Cleared existing newsletters");

    // Insert mock newsletters
    await Newsletter.insertMany(mockNewsletters);
    console.log(`✅ Inserted ${mockNewsletters.length} mock newsletters`);

    // Insert mock subscribers (only if they don't exist)
    let insertedCount = 0;
    for (const sub of mockSubscribers) {
      const existing = await Lead.findOne({ email: sub.email });
      if (!existing) {
        await Lead.create(sub);
        insertedCount++;
      }
    }
    console.log(`✅ Inserted ${insertedCount} mock subscribers`);

    console.log("🎉 Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase;

