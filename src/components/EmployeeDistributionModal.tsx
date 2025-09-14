
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployeeDistributionModalProps {
  open: boolean;
  onClose: () => void;
  employeeDistribution: Record<string, number>;
}

export function EmployeeDistributionModal({ 
  open, 
  onClose, 
  employeeDistribution 
}: EmployeeDistributionModalProps) {
  const totalEmployees = Object.values(employeeDistribution).reduce((sum, count) => sum + count, 0);
  
  const sortedDistribution = Object.entries(employeeDistribution)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Distribuição de Funcionários por Função
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Total de Funcionários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalEmployees}</div>
              <p className="text-sm text-muted-foreground">funcionários distribuídos em todas as funções</p>
            </CardContent>
          </Card>

          {sortedDistribution.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Distribuição por Função</h3>
              <div className="grid gap-2">
                {sortedDistribution.map(([jobTitle, count]) => (
                  <div key={jobTitle} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <span className="font-medium">{jobTitle}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-600">{count}</span>
                      <span className="text-sm text-muted-foreground">
                        ({((count / totalEmployees) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum funcionário registrado ainda</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
