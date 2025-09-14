
import React from 'react';
import { MapPin, Building, AlertTriangle, TrendingUp } from "lucide-react";

interface PDFAnalysisSectionProps {
  activities: any[];
}

export function PDFAnalysisSection({ activities }: PDFAnalysisSectionProps) {
  // Análise de atividades não concluídas por ativo/área
  const getNotCompletedByAssetArea = () => {
    const notCompleted = activities.filter(a => a.status === 'not-completed');
    const byAsset = notCompleted.reduce((acc: any, activity) => {
      const key = activity.asset || 'Não definido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    const byArea = notCompleted.reduce((acc: any, activity) => {
      const key = activity.location || 'Não definido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topAsset = Object.entries(byAsset).sort(([,a]: any, [,b]: any) => (b as number) - (a as number))[0];
    const topArea = Object.entries(byArea).sort(([,a]: any, [,b]: any) => (b as number) - (a as number))[0];

    return { topAsset, topArea };
  };

  // Análise de maior quantidade de atividades por ativo/área
  const getMostActivitiesByAssetArea = () => {
    const byAsset = activities.reduce((acc: any, activity) => {
      const key = activity.asset || 'Não definido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    const byArea = activities.reduce((acc: any, activity) => {
      const key = activity.location || 'Não definido';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topAsset = Object.entries(byAsset).sort(([,a]: any, [,b]: any) => (b as number) - (a as number))[0];
    const topArea = Object.entries(byArea).sort(([,a]: any, [,b]: any) => (b as number) - (a as number))[0];

    return { topAsset, topArea };
  };

  // Identificar problemas
  const getIdentifiedProblems = () => {
    const problems = [];
    
    const delayedCount = activities.filter(a => a.status === 'delayed').length;
    const notCompletedCount = activities.filter(a => a.status === 'not-completed').length;
    const pendingCount = activities.filter(a => a.status === 'pending').length;
    
    if (delayedCount > 0) {
      problems.push({
        type: 'error',
        title: 'Atividades em Atraso',
        description: `${delayedCount} atividades estão atrasadas e precisam de atenção imediata`,
        icon: AlertTriangle,
        count: delayedCount
      });
    }

    if (notCompletedCount > 0) {
      problems.push({
        type: 'error',
        title: 'Atividades Não Concluídas',
        description: `${notCompletedCount} atividades não foram concluídas no prazo`,
        icon: AlertTriangle,
        count: notCompletedCount
      });
    }

    if (pendingCount > 0) {
      problems.push({
        type: 'warning',
        title: 'Atividades Pendentes',
        description: `${pendingCount} atividades ainda não foram iniciadas`,
        icon: AlertTriangle,
        count: pendingCount
      });
    }

    // Análise por disciplina com problemas
    const disciplineProblems = activities
      .filter(a => a.status === 'delayed' || a.status === 'not-completed')
      .reduce((acc: any, activity) => {
        const discipline = activity.discipline || 'Geral';
        acc[discipline] = (acc[discipline] || 0) + 1;
        return acc;
      }, {});

    const topProblemDiscipline = Object.entries(disciplineProblems)
      .sort(([,a]: any, [,b]: any) => (b as number) - (a as number))[0];

    if (topProblemDiscipline) {
      problems.push({
        type: 'warning',
        title: `Problemas na Disciplina ${topProblemDiscipline[0]}`,
        description: `${topProblemDiscipline[1]} atividades com problemas nesta disciplina`,
        icon: AlertTriangle,
        count: topProblemDiscipline[1] as number
      });
    }

    return problems;
  };

  const { topAsset: notCompletedAsset, topArea: notCompletedArea } = getNotCompletedByAssetArea();
  const { topAsset: mostActivitiesAsset, topArea: mostActivitiesArea } = getMostActivitiesByAssetArea();
  const problems = getIdentifiedProblems();

  return (
    <div className="mb-8 space-y-6">
      {/* Principais Ativos/Áreas com Problemas */}
      <div className="page-break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-red-500 pb-2">
          🚨 Análise de Problemas
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {notCompletedAsset && (
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center mb-2">
                <Building className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">Principal Ativo com Problemas</h3>
              </div>
              <p className="text-sm text-gray-700">
                <strong>{notCompletedAsset[0]}</strong>
              </p>
              <p className="text-xs text-gray-600">
                {String(notCompletedAsset[1])} atividades não concluídas
              </p>
            </div>
          )}

          {notCompletedArea && (
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">Principal Área com Problemas</h3>
              </div>
              <p className="text-sm text-gray-700">
                <strong>{notCompletedArea[0]}</strong>
              </p>
              <p className="text-xs text-gray-600">
                {String(notCompletedArea[1])} atividades não concluídas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Principais Ativos/Áreas por Volume */}
      <div className="page-break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-blue-500 pb-2">
          📈 Análise de Volume
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {mostActivitiesAsset && (
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <Building className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Ativo com Mais Atividades</h3>
              </div>
              <p className="text-sm text-gray-700">
                <strong>{mostActivitiesAsset[0]}</strong>
              </p>
              <p className="text-xs text-gray-600">
                {String(mostActivitiesAsset[1])} atividades totais
              </p>
            </div>
          )}

          {mostActivitiesArea && (
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Área com Mais Atividades</h3>
              </div>
              <p className="text-sm text-gray-700">
                <strong>{mostActivitiesArea[0]}</strong>
              </p>
              <p className="text-xs text-gray-600">
                {String(mostActivitiesArea[1])} atividades totais
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Problemas Identificados */}
      <div className="page-break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-orange-500 pb-2">
          ⚠️ Problemas Identificados
        </h2>
        
        <div className="space-y-3">
          {problems.length === 0 ? (
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="font-semibold text-green-800">Excelente! Nenhum problema crítico identificado</p>
                  <p className="text-sm text-green-700">Todas as atividades estão em conformidade</p>
                </div>
              </div>
            </div>
          ) : (
            problems.map((problem, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 ${
                  problem.type === 'error' 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start">
                  <problem.icon 
                    className={`w-5 h-5 mr-3 mt-0.5 ${
                      problem.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`} 
                  />
                  <div>
                    <p className={`font-semibold ${
                      problem.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {problem.title}
                    </p>
                    <p className={`text-sm ${
                      problem.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {problem.description}
                    </p>
                  </div>
                  <div className={`ml-auto text-lg font-bold ${
                    problem.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {problem.count}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
