'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Calendar as CalendarIcon, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ManualEntryTransaction } from '../types/reports.types';
import { cn } from '@/lib/utils';

interface ManualEntryProps {
  onSubmit: (data: ManualEntryTransaction[]) => void;
  onBack: () => void;
}

export const ManualEntry = ({ onSubmit, onBack }: ManualEntryProps) => {
  const [transactions, setTransactions] = useState<ManualEntryTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [date, setDate] = useState<Date>();
  const [type, setType] = useState<ManualEntryTransaction['type']>('buy');
  const [asset, setAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setDate(undefined);
    setType('buy');
    setAsset('');
    setAmount('');
    setPrice('');
    setFee('');
    setNotes('');
  };

  const handleAddTransaction = () => {
    if (!date || !asset || !amount || !price) return;

    const newTransaction: ManualEntryTransaction = {
      id: `manual-${Date.now()}-${Math.random()}`,
      date,
      type,
      asset,
      amount: parseFloat(amount),
      price: parseFloat(price),
      fee: fee ? parseFloat(fee) : undefined,
      notes: notes || undefined,
    };

    setTransactions([...transactions, newTransaction]);
    resetForm();
    setShowForm(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleSubmit = () => {
    if (transactions.length === 0) return;
    onSubmit(transactions);
  };

  const getTransactionTypeLabel = (type: ManualEntryTransaction['type']) => {
    const labels = {
      buy: 'Compra',
      sell: 'Venta',
      transfer: 'Transferencia',
      stake: 'Staking',
      airdrop: 'Airdrop',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">Entrada Manual de Transacciones</h2>
          <p className="text-muted-foreground">
            Agrega manualmente tus transacciones de criptomonedas
          </p>
        </div>
        {transactions.length > 0 && (
          <Button onClick={handleSubmit}>
            Continuar con {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''}
          </Button>
        )}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Ingresa todas tus transacciones de criptomonedas de forma manual. Asegúrate de incluir
          todas las operaciones del año fiscal para generar un reporte preciso.
        </AlertDescription>
      </Alert>

      {/* Transactions List */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Agregadas ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio (€)</TableHead>
                    <TableHead className="text-right">Total (€)</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(transaction.date, 'dd/MM/yyyy', { locale: es })}</TableCell>
                      <TableCell>
                        <span className="capitalize">{getTransactionTypeLabel(transaction.type)}</span>
                      </TableCell>
                      <TableCell className="font-mono">{transaction.asset}</TableCell>
                      <TableCell className="text-right">{transaction.amount.toFixed(8)}</TableCell>
                      <TableCell className="text-right">€{transaction.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        €{(transaction.amount * transaction.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Transaction Form */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} variant="outline" size="lg" className="w-full">
          <Plus className="mr-2 h-5 w-5" />
          Agregar Nueva Transacción
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Transacción</CardTitle>
            <CardDescription>Complete los detalles de la transacción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Transacción *</Label>
                <Select value={type} onValueChange={(value) => setType(value as ManualEntryTransaction['type'])}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Compra</SelectItem>
                    <SelectItem value="sell">Venta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="stake">Staking</SelectItem>
                    <SelectItem value="airdrop">Airdrop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Asset */}
              <div className="space-y-2">
                <Label htmlFor="asset">Criptomoneda *</Label>
                <Input
                  id="asset"
                  placeholder="Ej: BTC, ETH, USDT"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value.toUpperCase())}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Cantidad *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="any"
                  placeholder="0.00000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Precio Unitario (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* Fee */}
              <div className="space-y-2">
                <Label htmlFor="fee">Comisión (€)</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre la transacción (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Total */}
            {amount && price && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total de la Transacción:</span>
                  <span className="text-2xl font-bold">
                    €{(parseFloat(amount) * parseFloat(price)).toFixed(2)}
                  </span>
                </div>
                {fee && (
                  <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                    <span>Comisión:</span>
                    <span>€{parseFloat(fee).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddTransaction}
                disabled={!date || !asset || !amount || !price}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Transacción
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button at bottom if there are transactions */}
      {transactions.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} size="lg">
            Continuar con {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''}
          </Button>
        </div>
      )}
    </div>
  );
};
