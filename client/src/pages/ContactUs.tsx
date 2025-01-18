import { Button } from "@/components/ui/button"; // Certifique-se de ajustar o caminho para o correto
import { useNavigate } from "react-router-dom";

export const ContactUs = () => {
  const navigate = useNavigate();

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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg leading-8 mb-6">
          We'd love to hear from you! Whether you have a question about
          features, pricing, need a demo, or anything else, our team is ready to
          answer all your questions.
        </p>

        {/* Formulário de Contato */}
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Your Name"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm shadow-sm focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Your Email"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm shadow-sm focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              placeholder="Write your message here..."
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm shadow-sm focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
            ></textarea>
          </div>

          <Button className="w-full md:w-auto" type="submit">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
