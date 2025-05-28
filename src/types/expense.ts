export interface Expense {
  id: string;
  concepto: string;
  fecha: string | Date;
  metodo: string;
  monto: number;
  userId: string;
  email?: string; // Opcional ya que no todos los gastos podrían tener email
} 