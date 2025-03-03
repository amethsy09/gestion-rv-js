export function createModal(imageSrc, message, color) {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10";

  modal.innerHTML = `
    <div class="bg-white p-4 rounded shadow-lg w-full max-w-md text-center relative">
    <img src="/frontend/public/assets/${imageSrc}" alt="Modal Image" class="h-20 mx-auto mb-4"/>
      <p class="text-gray-700 text-lg">${message}</p>
      <button id="closeModal" class="mt-4 px-3 py-2 bg-${color}-500 text-white rounded hover:bg-${color}-600">
        Fermer
      </button>
    </div>
  `;

  const closeModal = () => {
    modal.remove();
  };
  modal.querySelector("#closeModal").addEventListener("click", closeModal);
  return modal;
}
