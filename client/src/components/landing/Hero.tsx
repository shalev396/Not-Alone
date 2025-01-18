import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { HeroCards } from "./HeroCards";
import { useState } from "react";

export const Hero = () => {
  const [open, setOpen] = useState(false); // Controle de abertura do modal
  const [showMessage, setShowMessage] = useState(false); // Controle da mensagem de carinha triste

  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              Not Alone
            </span>{" "}
            a Platform
          </h1>{" "}
          for{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              Lone Soldiers
            </span>{" "}
            of the IDF
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Connect with and support IDF Lone Soldiers through donations,
          resources, and community engagement.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          {/* Botão para abrir o modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full md:w-1/3"
                onClick={() => {
                  setShowMessage(false); // Resetar o conteúdo do modal
                  setOpen(true);
                }}
              >
                Start Donating
              </Button>
            </DialogTrigger>

            {/* Conteúdo do Modal */}
            <DialogContent className="bg-card text-card-foreground p-6 max-w-lg mx-auto rounded-lg">
              {!showMessage ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                  <p className="text-muted-foreground mb-6">
                    Add a new payment method to your account.
                  </p>

                  {/* Formulário de Pagamento */}
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowMessage(true); // Mostrar a mensagem de carinha triste
                    }}
                  >
                    <div className="flex space-x-2">
                      <Button variant="outline" className="w-full">
                        Card
                      </Button>
                      <Button variant="outline" className="w-full">
                        Paypal
                      </Button>
                      <Button variant="outline" className="w-full">
                        Apple
                      </Button>
                    </div>

                    <input
                      type="text"
                      placeholder="Name"
                      className="block w-full rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      className="block w-full rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Card number"
                      className="block w-full rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                    />

                    <div className="flex space-x-2">
                      <select className="block w-1/3 rounded-md border border-gray-300 py-2 px-4 text-gray-600 focus:ring focus:ring-primary">
                        <option>Month</option>
                      </select>
                      <select className="block w-1/3 rounded-md border border-gray-300 py-2 px-4 text-gray-600 focus:ring focus:ring-primary">
                        <option>Year</option>
                      </select>
                      <input
                        type="text"
                        placeholder="CVC"
                        className="block w-1/3 rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl">😢</div>
                  <h3 className="text-xl font-bold">We’re sorry!</h3>
                  <p className="text-muted-foreground">
                    We are not accepting monetary donations at the moment.
                    Please check back later!
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="w-full md:w-1/3"
            onClick={() => {
              location.href = "#about";
            }}
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
