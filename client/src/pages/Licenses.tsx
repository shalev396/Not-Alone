import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Licenses() {
  const navigate = useNavigate();
  const licenses = [
    {
      component: "Landing Page Template",
      author: "Leopoldo Miranda",
      license: "MIT",
      licenseText: `MIT License

Copyright (c) 2024 Leopoldo Miranda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
      usage:
        "Used as the base template for the landing page design and structure.",
      link: "https://github.com/leoMirandaa",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-transparent hover:text-primary"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home page
        </Button>

        <h1 className="text-4xl font-bold mb-8 text-center">
          Third-Party <span className="text-primary">Licenses</span>
        </h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          We are grateful to the open-source community for their contributions.
          This page lists the licenses of third-party software used in Not
          Alone.
        </p>

        <div className="space-y-8">
          {licenses.map((license, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-muted">
                <CardTitle className="flex items-center justify-between">
                  <span>{license.component}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {license.license} License
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-semibold">Author:</span>{" "}
                    <a
                      href={license.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {license.author}
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="font-semibold">Usage:</span>{" "}
                    {license.usage}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {license.licenseText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
