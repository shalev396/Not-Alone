import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { GiftIcon } from "@/components/landing/Icons";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

export const HeroCards = () => {
  const [open, setOpen] = useState(false); // Estado para o modal
  const [showMessage, setShowMessage] = useState(false); // Controle para mostrar a mensagem de carinha triste

  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-6 relative w-[600px] h-[450px]">
      {/* Testimonial */}
      <Card className="absolute w-[300px] -top-[15px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar>
            <AvatarImage
              alt=""
              src="https://newprofilepic.photo-cdn.net//assets/images/article/profile.jpg?90af0c8"
            />
            <AvatarFallback>SH</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-lg">Sarah Cohen</CardTitle>
            <CardDescription>Donor</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          Supporting Lone Soldiers has been an incredible experience!
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="absolute right-[15px] top-4 w-[280px] flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="mt-8 flex justify-center items-center pb-2">
          <img
            src="https://media.istockphoto.com/id/1154642632/photo/close-up-portrait-of-brunette-woman.jpg?s=612x612&w=0&k=20&c=d8W_C2D-2rXlnkyl8EirpHGf-GpM62gBjpDoNryy98U="
            alt="user avatar"
            className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
          />
          <CardTitle className="text-center">Maya Levin</CardTitle>
          <CardDescription className="font-normal text-primary">
            Donor Coordinator
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-2">
          <p>Connecting donors with Lone Soldiers to create lasting impact</p>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="absolute top-[150px] left-[40px] w-[260px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            Impact
            <Badge variant="secondary" className="text-sm text-primary">
              Make a Difference
            </Badge>
          </CardTitle>
          <CardDescription>
            Your support helps Lone Soldiers focus on their service
          </CardDescription>
        </CardHeader>

        <div className="space-y-4 md:space-y-0 w-50 mx-auto md:space-x-">
          {/* Botão para abrir o modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full ml-100"
                onClick={() => {
                  setShowMessage(false); // Resetar o conteúdo do modal
                  setOpen(true);
                }}
              >
                Donate
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
        </div>

        <hr className="w-4/5 m-auto mb-4" />

        <CardFooter className="flex">
          <div className="space-y-4">
            {["Direct Support", "Verified Recipients", "Real Impact"].map(
              (benefit: string) => (
                <span key={benefit} className="flex">
                  <Check className="text-green-500" />{" "}
                  <h3 className="ml-2">{benefit}</h3>
                </span>
              )
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Service */}
      <Card className="absolute w-[300px] -right-[10px] bottom-[35px] drop-shadow-xl shadow-black/10 dark:shadow-white/10 top-52">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
            <GiftIcon />
          </div>
          <div>
            <CardTitle>Verified Support</CardTitle>
            <CardDescription className="text-md mt-2">
              Every donation request is verified and tracked to ensure your
              support reaches the Lone Soldiers who need it most.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
