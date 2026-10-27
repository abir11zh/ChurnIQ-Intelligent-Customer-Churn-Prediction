import { z } from "zod";

export const predictionSchema = z.object({
  tenure: z.coerce.number().min(0).max(72),
  MonthlyCharges: z.coerce.number().min(0).max(200),
  TotalCharges: z.coerce.number().min(0),
  gender: z.enum(["Male", "Female"]),
  SeniorCitizen: z.enum(["Yes", "No"]),
  Partner: z.enum(["Yes", "No"]),
  Dependents: z.enum(["Yes", "No"]),
  PhoneService: z.enum(["Yes", "No"]),
  MultipleLines: z.string(),
  InternetService: z.string(),
  OnlineSecurity: z.string(),
  OnlineBackup: z.string(),
  DeviceProtection: z.string(),
  TechSupport: z.string(),
  StreamingTV: z.string(),
  StreamingMovies: z.string(),
  Contract: z.string(),
  PaperlessBilling: z.string(),
  PaymentMethod: z.string()
});

export type PredictionFormValues = z.infer<typeof predictionSchema>;
