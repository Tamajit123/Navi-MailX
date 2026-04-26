import { spawn } from "node:child_process";

const baseUrl = process.env.OLLAMA_BASE_URL || "http://ollama:11434";
const maxAttempts = 40;
const delayMs = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForOllama() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(new URL("/api/tags", baseUrl), {
        cache: "no-store"
      });

      if (response.ok) {
        console.info(`Ollama became reachable on attempt ${attempt}.`);
        return;
      }
    } catch (error) {
      console.info(`Waiting for Ollama (${attempt}/${maxAttempts}): ${error.message}`);
    }

    await sleep(delayMs);
  }

  console.error("Ollama did not become reachable before timeout.");
  process.exit(1);
}

await waitForOllama();

const child = spawn("npm", ["run", "start"], {
  stdio: "inherit",
  shell: true
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
