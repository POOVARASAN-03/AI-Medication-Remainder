import React from 'react';

const MedicineTable = ({ medicines, interactions }) => {
  return (
    <div className="overflow-x-auto">
      {medicines && medicines.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Extracted Medicines</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.map((med, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {interactions && interactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Drug Interactions</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine 1</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine 2</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interactions.map((interaction, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{interaction.med1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.med2}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interaction.severity}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{interaction.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(!medicines || medicines.length === 0) && (!interactions || interactions.length === 0) && (
        <p className="text-gray-600">No medicine or interaction data available.</p>
      )}
    </div>
  );
};

export default MedicineTable;
