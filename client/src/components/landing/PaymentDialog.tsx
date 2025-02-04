import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Apple, CircleDollarSign } from "lucide-react";
import { useState } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

interface PaymentDialogProps {
  triggerClassName?: string;
  triggerText: string;
}

// Zod schema for card payment validation
const cardPaymentSchema = z.object({
  cardName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  cardNumber: z.string().regex(/^[0-9]{16}$/, "Card number must be 16 digits"),
  expiryMonth: z
    .string()
    .min(1, "Please select a month")
    .regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z
    .string()
    .min(1, "Please select a year")
    .regex(/^20[2-9][0-9]$/, "Invalid year"),
  cvc: z.string().regex(/^[0-9]{3}$/, "CVC must be 3 digits"),
});

type CardPaymentForm = z.infer<typeof cardPaymentSchema>;

export const PaymentDialog = ({
  triggerClassName,
  triggerText,
}: PaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const formik = useFormik<CardPaymentForm>({
    initialValues: {
      cardName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
    },
    validationSchema: toFormikValidationSchema(cardPaymentSchema),
    onSubmit: (values) => {
      console.log("Form values:", values);
      setShowMessage(true);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={triggerClassName}
          onClick={() => {
            setShowMessage(false);
            setOpen(true);
          }}
        >
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-card text-card-foreground p-6 max-w-lg mx-auto rounded-lg">
        {!showMessage ? (
          <>
            <h3 className="text-xl font-bold mb-4">Payment Method</h3>
            <p className="text-muted-foreground mb-6">
              Add a new payment method to your account.
            </p>

            <Tabs defaultValue="card" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Card
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" />
                  PayPal
                </TabsTrigger>
                <TabsTrigger value="apple" className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  Apple Pay
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card">
                <form className="space-y-4" onSubmit={formik.handleSubmit}>
                  <div>
                    <input
                      id="cardName"
                      placeholder="Name on Card"
                      className={`block w-full rounded-md border ${
                        formik.touched.cardName && formik.errors.cardName
                          ? "border-destructive"
                          : "border-input"
                      } bg-background py-2 px-4 text-sm focus:ring-2 focus:ring-primary`}
                      {...formik.getFieldProps("cardName")}
                    />
                    {formik.touched.cardName && formik.errors.cardName && (
                      <p className="mt-1 text-sm text-destructive">
                        {formik.errors.cardName}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      id="cardNumber"
                      placeholder="Card Number"
                      maxLength={16}
                      className={`block w-full rounded-md border ${
                        formik.touched.cardNumber && formik.errors.cardNumber
                          ? "border-destructive"
                          : "border-input"
                      } bg-background py-2 px-4 text-sm focus:ring-2 focus:ring-primary`}
                      {...formik.getFieldProps("cardNumber")}
                    />
                    {formik.touched.cardNumber && formik.errors.cardNumber && (
                      <p className="mt-1 text-sm text-destructive">
                        {formik.errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <div className="w-1/3">
                      <select
                        id="expiryMonth"
                        className={`block w-full rounded-md border ${
                          formik.touched.expiryMonth &&
                          formik.errors.expiryMonth
                            ? "border-destructive"
                            : "border-input"
                        } bg-background py-2 px-4 text-muted-foreground focus:ring-2 focus:ring-primary`}
                        {...formik.getFieldProps("expiryMonth")}
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <option
                              key={month}
                              value={month.toString().padStart(2, "0")}
                            >
                              {month.toString().padStart(2, "0")}
                            </option>
                          )
                        )}
                      </select>
                      {formik.touched.expiryMonth &&
                        formik.errors.expiryMonth && (
                          <p className="mt-1 text-sm text-destructive">
                            {formik.errors.expiryMonth}
                          </p>
                        )}
                    </div>

                    <div className="w-1/3">
                      <select
                        id="expiryYear"
                        className={`block w-full rounded-md border ${
                          formik.touched.expiryYear && formik.errors.expiryYear
                            ? "border-destructive"
                            : "border-input"
                        } bg-background py-2 px-4 text-muted-foreground focus:ring-2 focus:ring-primary`}
                        {...formik.getFieldProps("expiryYear")}
                      >
                        <option value="">Year</option>
                        {Array.from(
                          { length: 10 },
                          (_, i) => new Date().getFullYear() + i
                        ).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      {formik.touched.expiryYear &&
                        formik.errors.expiryYear && (
                          <p className="mt-1 text-sm text-destructive">
                            {formik.errors.expiryYear}
                          </p>
                        )}
                    </div>

                    <div className="w-1/3">
                      <input
                        id="cvc"
                        placeholder="CVC"
                        maxLength={3}
                        className={`block w-full rounded-md border ${
                          formik.touched.cvc && formik.errors.cvc
                            ? "border-destructive"
                            : "border-input"
                        } bg-background py-2 px-4 text-sm focus:ring-2 focus:ring-primary`}
                        {...formik.getFieldProps("cvc")}
                      />
                      {formik.touched.cvc && formik.errors.cvc && (
                        <p className="mt-1 text-sm text-destructive">
                          {formik.errors.cvc}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formik.isSubmitting || !formik.isValid}
                  >
                    {formik.isSubmitting ? "Processing..." : "Continue"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="paypal">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    You will be redirected to PayPal to complete your payment.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => setShowMessage(true)}
                  >
                    Continue with PayPal
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="apple">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    Complete your payment using Apple Pay.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => setShowMessage(true)}
                  >
                    Pay with Apple Pay
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl">😢</div>
            <h3 className="text-xl font-bold">We're sorry!</h3>
            <p className="text-muted-foreground">
              We are not accepting monetary donations at the moment. Please
              check back later!
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
  );
};
