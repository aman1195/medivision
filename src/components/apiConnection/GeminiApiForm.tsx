
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ApiKeyTester } from "./ApiKeyTester";
import { useEffect } from "react";

const apiKeySchema = z.object({
  apiKey: z.string().min(10, { message: "API key must be at least 10 characters" }),
});

export const GeminiApiForm = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: "",
    },
  });

  // Load saved API key if available
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini_api_key");
    if (savedApiKey) {
      form.setValue("apiKey", savedApiKey);
    }
  }, [form]);

  const onSubmit = (data: z.infer<typeof apiKeySchema>) => {
    // Save API key to localStorage
    localStorage.setItem("gemini_api_key", data.apiKey);
    
    toast({
      title: "Gemini API Key Saved",
      description: "Your Gemini API key has been saved",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gemini API Key</CardTitle>
        <CardDescription>
          Set your Gemini API key for AI text generation and analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <ApiKeyTester apiKey={field.value} apiType="gemini" />
                  </div>
                  <FormDescription>
                    Your Gemini API key is stored securely in your browser. Get a key at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save API Key</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
