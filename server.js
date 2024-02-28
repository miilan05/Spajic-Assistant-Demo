const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const OpenAI = require("openai");

const openai = new OpenAI();

const PORT = 3000;
const CLIENT_ORIGIN = ["https://miilan05.github.io"];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

const msgAddon =
    "Respond in the same language as the message from the user. Don't respond to messages unrelated to the company. The message: ";

// const assistantId = "asst_3BuQnBbMAWDJisATjTEIuoxZ";
const assistantId = "asst_BV6xaTwIWQiXKec6SKDKxUfk";

const userThreads = {};

io.on("connection", (socket) => {
    console.log(socket.id, " connected");

    socket.on("message", handleMessage);
});

async function handleMessage(msg) {
    if (!userThreads[this.id]) {
        userThreads[this.id] = await createThread();
    }
    const thread = userThreads[this.id];
    let message = await addMsgToThread(thread, msgAddon + msg);
    let run = await runAssistant(thread, assistantId);

    // Check the status of the run periodically
    const isCompleted = await checkRunStatus(thread.id, run.id);
    if (isCompleted) {
        let messages = await displayAssistantResponse(thread.id);
        let msg = cleanMessage(
            messages["data"][0]["content"][0]["text"]["value"]
        );
        io.to(this.id).emit("response", msg);
    }
}

function cleanMessage(msg) {
    while (msg.includes("【") && msg.includes("】")) {
        msg = msg.replace(
            msg.slice(msg.indexOf("【"), msg.indexOf("】") + 1),
            ""
        );
    }
    return msg;
    // console.log(msg);
}

async function createThread() {
    return await openai.beta.threads.create();
}

async function addMsgToThread(thread, msg) {
    return await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: msg,
    });
}

async function runAssistant(thread, assistantId) {
    return await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
        // instructions: "Please address the user as Jane Doe. The user has a premium account.",
    });
}

async function displayAssistantResponse(threadId) {
    const messages = await openai.beta.threads.messages.list(threadId);
    // Display or handle the assistant's response
    // console.log(messages["data"][0]["content"]);
    // console.log(messages["data"][0]["content"][0]["text"]);
    return messages;
}

async function checkRunStatus(threadId, runId) {
    let status = "queued";
    while (status !== "completed") {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        status = run.status;
        if (status === "completed") {
            return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay for 5 seconds before checking again
    }
}

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
