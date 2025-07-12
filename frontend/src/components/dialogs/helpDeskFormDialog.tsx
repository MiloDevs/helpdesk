"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";

// ----------- Schemas & Types -----------

const step1Schema = z.object({
  issueDescription: z.string().min(2, "Please describe your issue."),
});
type Step1Type = z.infer<typeof step1Schema>;

const step2Schema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  floorNumber: z.coerce.number().min(1, "Floor number is required."),
  officeNumber: z.coerce.number().min(1, "Office number is required."),
});
type Step2Type = z.infer<typeof step2Schema>;

type FormData = Step1Type & Step2Type;

interface StepProps<T> {
  form: UseFormReturn<T>;
  formData: FormData;
  updateForm: (data: Partial<FormData>) => void;
}

// ----------- Step Components -----------

function Step1({ form }: StepProps<Step1Type>) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl mb-2">
        Welcome to <strong>HelpDesk.</strong>
      </h1>
      <p className="text-sm mb-4">
        Please provide a description of the issue you're experiencing.
      </p>
      <FormField
        control={form.control}
        name="issueDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Issue Description</FormLabel>
            <FormControl>
              <Textarea
                rows={6}
                placeholder="e.g., Air conditioning not working"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Step2({ form }: StepProps<Step2Type>) {
  return (
    <div className="space-y-3">
      <h1 className="text-lg mb-2">Where are you located?</h1>
      <p className="text-sm mb-4">
        Fill in the office details so our team can reach you.
      </p>

      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="officeNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Office Number</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="floorNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Floor Number</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// ----------- Dialog Form Component -----------

interface HelpDeskDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function HelpDeskDialog({ props }: HelpDeskDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formEntryCompleted, setFormEntryCompleted] = React.useState(false);
  const formDataRef = React.useRef<Partial<FormData>>({});

  const step1Form = useForm<Step1Type>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      issueDescription: "",
    },
  });

  const step2Form = useForm<Step2Type>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      fullName: "",
      floorNumber: 0,
      officeNumber: 0,
    },
  });

  const steps = [
    { Component: Step1, form: step1Form },
    { Component: Step2, form: step2Form },
  ];
  const { Component: CurrentStep, form } = steps[currentStep];

  function updateForm(data: Partial<FormData>) {
    formDataRef.current = { ...formDataRef.current, ...data };
  }

  async function nextStep() {
    const valid = await form.trigger();
    if (!valid) return;

    updateForm(form.getValues() as Partial<FormData>);

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setFormEntryCompleted(true);
      setTimeout(() => {
        console.log("Final submitted data:", formDataRef.current);
        setOpen(false);
        setFormEntryCompleted(false);
        setCurrentStep(0);
        step1Form.reset();
        step2Form.reset();
      }, 2000);
    }
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Report an Issue</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        {!formEntryCompleted ? (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                nextStep();
              }}
              className="space-y-6"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <CurrentStep
                    form={form}
                    formData={formDataRef.current as FormData}
                    updateForm={updateForm}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-4 pt-2">
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="rounded-full"
                  >
                    Previous
                  </Button>
                ) : (
                  <div />
                )}
                <Button type="submit" className="rounded-full">
                  {currentStep === steps.length - 1 ? "Submit" : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex items-center gap-3">
            <LoaderCircle className="animate-spin" />
            <p className="text-sm font-medium">Submitting your ticket...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
