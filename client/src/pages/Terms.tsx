import { useNavigate } from "react-router-dom";

export const Terms = () => {
  const navigate = useNavigate();

  const dummyData = `
    Welcome to Not Alone! By using this platform, you agree to the following terms and conditions:
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero.
    Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. 
    Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. 
    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales 
    ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque 
    sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.
    Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. 
    Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. 
    Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, 
    urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. 
    Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. 
    Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna.
  `;

  return (
    <div className="min-h-screen bg-background text-foreground relative px-4 py-6 md:px-20">
      {/* Botão de Voltar */}
      <button
        onClick={() => navigate("/")} // Navega para a página principal
        className="absolute top-5 right-5 p-3 rounded-full bg-gray-800 text-gray-100 hover:bg-gray-700 transition-all shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7" // Corrigido para a seta apontar para a direita
          />
        </svg>
      </button>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-lg leading-8">{dummyData}</p>
      </div>
    </div>
  );
};

export default Terms;
