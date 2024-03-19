import { MongoClient } from "mongodb";

// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://adil5679:adil5679@cluster0.00tt7hd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to your Atlas cluster
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to Atlas !!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    } catch (err) {
        console.log(err.stack);
        await client.close();
        process.exit(0)
    }
}

run().catch(console.dir);
process.on("SIGINT", async () => {
    console.log('SIGINT signal received. Exiting gracefully...');
    await client.close();
})

export default client;