import { mockCustomers } from "../data/foundation";
import type { Customer } from "../types/domain";
import { apiClient } from "./apiClient";

function mapApiCustomer(customer: any): Customer {
  return {
    id: customer.id,
    customerId: customer.customer_id,
    name: customer.name,
    email: customer.email,
    gender: customer.gender,
    contract: customer.Contract,
    tenure: Number(customer.tenure ?? 0),
    monthlyCharges: Number(customer.MonthlyCharges ?? 0),
    totalCharges: Number(customer.TotalCharges ?? 0),
    churnProbability: Number(customer.churn_probability ?? 0),
    riskLevel: customer.risk_level,
    segment: customer.segment,
    createdAt: customer.created_at
  };
}

export async function listCustomers(): Promise<Customer[]> {
  try {
    const { data } = await apiClient.get("/customers");
    return data.data.customers.map(mapApiCustomer);
  } catch {
    return mockCustomers;
  }
}

export async function getCustomerById(customerId: string): Promise<Customer | undefined> {
  try {
    const { data } = await apiClient.get(`/customers/${customerId}`);
    return mapApiCustomer(data.data);
  } catch {
    return mockCustomers.find((customer) => customer.customerId === customerId || customer.id === customerId);
  }
}

export async function createCustomer(payload: unknown): Promise<Customer> {
  const { data } = await apiClient.post("/customers", payload);
  return mapApiCustomer(data.data);
}

export async function updateCustomer(customerId: string, payload: unknown): Promise<Customer> {
  const { data } = await apiClient.put(`/customers/${customerId}`, payload);
  return mapApiCustomer(data.data);
}

export async function deleteCustomer(customerId: string) {
  const { data } = await apiClient.delete(`/customers/${customerId}`);
  return data.data;
}
