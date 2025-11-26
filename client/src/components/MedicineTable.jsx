import React from 'react';
import { Pill, AlertTriangle } from 'lucide-react';

const MedicineTable = ({ medicines, interactions }) => {
  return (
    <div className="space-y-8">
      {medicines && medicines.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Extracted Medicines</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((med, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.dosage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {interactions && interactions.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Drug Interactions Detected</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-100">
              <thead className="bg-red-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-600 uppercase tracking-wider">Medicine 1</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-600 uppercase tracking-wider">Medicine 2</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-600 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-red-600 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-100">
                {interactions.map((interaction, index) => (
                  <tr key={index} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{interaction.med1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{interaction.med2}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${interaction.severity.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                          interaction.severity.toLowerCase() === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'}`}>
                        {interaction.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{interaction.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!medicines || medicines.length === 0) && (!interactions || interactions.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No medicine or interaction data available.</p>
        </div>
      )}
    </div>
  );
};

export default MedicineTable;
