import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Skill } from "@shared/schema";
import type { SkillFormData } from "@/types";

const skillFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  category: z.enum(["technique", "managériale", "comportementale", "transversale"], {
    required_error: "La catégorie est requise",
  }),
});

interface SkillFormProps {
  skill?: Skill;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SkillForm({ skill, onSuccess, onCancel }: SkillFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SkillFormData>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: skill?.name || "",
      description: skill?.description || "",
      category: skill?.category as SkillFormData["category"] || "technique",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SkillFormData) => {
      await apiRequest("POST", "/api/skills", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Succès",
        description: "Compétence créée avec succès",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la compétence",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SkillFormData) => {
      await apiRequest("PUT", `/api/skills/${skill!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({
        title: "Succès",
        description: "Compétence modifiée avec succès",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification de la compétence",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SkillFormData) => {
    if (skill) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{skill ? "Modifier la Compétence" : "Nouvelle Compétence"}</CardTitle>
        <CardDescription>
          {skill ? "Modifiez les informations de la compétence" : "Ajoutez une nouvelle compétence au référentiel"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la Compétence</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: React.js, Leadership, Communication..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technique">Technique</SelectItem>
                      <SelectItem value="managériale">Managériale</SelectItem>
                      <SelectItem value="comportementale">Comportementale</SelectItem>
                      <SelectItem value="transversale">Transversale</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez cette compétence et ses spécificités..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : skill ? "Modifier" : "Créer"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
