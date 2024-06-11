import {
  MLCEngineWorkerHandler,
  MLCEngine,
} from "https://esm.run/@mlc-ai/web-llm";

// Crear una instancia del motor de IA
const engine = new MLCEngine();

// Crear una instancia del manejador del worker para el motor de IA
const handler = new MLCEngineWorkerHandler(engine);

// Definir un event listener para mensajes entrantes
onmessage = (msg) => {
  handler.onmessage(msg);
};
