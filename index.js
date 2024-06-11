/**
 * Este modelo de lenguaje es totalmente gratuito y tiene su documentación
 * en el siguirnte enlace de GitHub: https://github.com/mlc-ai/web-llm/blob/main/README.md
 * El modelo se importa de la siguiente forma.
 */
import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

// Utilidad para seleccionar elementos del DOM
const $ = (el) => document.querySelector(el);

// Selección de elementos del DOM necesarios para la funcionalidad
const $form = $("form");
const $input = $("input");
const $template = $("#message-template");
const $messages = $("ul");
const $container = $("main");
const $button = $("button");
const $info = $("small");

// Array para almacenar los mensajes de la conversación
let messages = [];

// Modelo seleccionado para el motor de IA
const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f32_1-MLC-1k";

// Creación del motor de IA utilizando un worker
const engine = await CreateWebWorkerMLCEngine(
  new Worker("worker.js", { type: "module" }),
  SELECTED_MODEL,
  {
    // Callback para mostrar el progreso de la inicialización
    initProgressCallback: (info) => {
      $info.textContent = `${info.text}%`;
      if (info.progress === 1) {
        $button.removeAttribute("disabled");
      }
    },
  }
);

// Evento que se ejecuta al enviar el formulario
$form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Previene la acción por defecto del formulario
  const messageText = $input.value.trim(); // Obtiene y recorta el texto del input

  if (messageText !== "") {
    // Si el texto no está vacío, limpia el input
    $input.value = "";
  }

  // Añade el mensaje del usuario al DOM
  addMessage(messageText, "user");
  $button.setAttribute("disabled", ""); // Desactiva el botón mientras se procesa el mensaje

  const userMessage = {
    role: "user",
    content: messageText,
  };

  // Añade el mensaje del usuario al array de mensajes
  messages.push(userMessage);

  // Genera la respuesta de la IA en chunks
  const chunks = await engine.chat.completions.create({
    messages,
    stream: true,
  });

  let reply = "";

  // Añade un mensaje vacío del bot al DOM para luego actualizarlo con la respuesta
  const $botMessage = addMessage("", "bot");

  // Procesa cada chunk de la respuesta de la IA
  for await (const chunk of chunks) {
    const choice = chunk.choices[0];
    const content = choice?.delta?.content ?? "";
    reply += content;
    $botMessage.textContent = reply; // Actualiza el contenido del mensaje del bot en el DOM
  }

  // Vuelve a activar el botón una vez procesada la respuesta
  $button.removeAttribute("disabled");

  // Añade la respuesta del asistente al array de mensajes
  messages.push({
    role: "assistant",
    content: reply,
  });

  // Desplaza el contenedor principal hacia abajo para mostrar el último mensaje
  $container.scrollTop = $container.scrollHeight;
});

// Función para añadir un mensaje al DOM
function addMessage(text, sender) {
  // Clona el template del mensaje
  const clonedTemplate = $template.content.cloneNode(true);
  const $newMessage = clonedTemplate.querySelector(".message");

  const $who = $newMessage.querySelector("span");
  const $text = $newMessage.querySelector("p");

  $text.textContent = text;
  $who.textContent = sender === "bot" ? "GPT" : "Tú"; // Define el remitente del mensaje
  $newMessage.classList.add(sender); // Añade la clase correspondiente al mensaje

  // Añade el mensaje al contenedor de mensajes
  $messages.appendChild($newMessage);

  // Desplaza el contenedor principal hacia abajo para mostrar el último mensaje
  $container.scrollTop = $container.scrollHeight;

  return $text; // Retorna el elemento de texto del mensaje
}
