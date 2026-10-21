'use client';

type ExportProps = {
  data: any[];
  headers: { label: string; key: string }[];
  filename: string;
};

export function ExportButton({ data, headers, filename }: ExportProps) {
  const downloadCSV = () => {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    // हेडर की लाइन तैयार करें
    const headerRow = headers.map(h => h.label).join(',');

    // डेटा की लाइनें तैयार करें
    const csvRows = data.map(item => {
      return headers.map(h => {
        let val = item[h.key];
        
        // अगर वैल्यू undefined या null है
        if (val === undefined || val === null) val = '';

        // अगर डेट है, तो उसे फॉर्मेट करें
        if (h.key.includes('date') || h.key.includes('created_at')) {
            val = new Date(val).toLocaleDateString('en-IN');
        }

        // अगर वैल्यू में कॉमा (,) है, तो उसे कोट्स में रखें
        const stringVal = String(val);
        if (stringVal.includes(',') || stringVal.includes('"')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      }).join(',');
    });

    // सारी लाइनों को जोड़ें
    const csvContent = [headerRow, ...csvRows].join('\n');

    // Excel में हिंदी/सिंबल सही दिखें, इसके लिए BOM (Byte Order Mark) जोड़ें
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadCSV} 
      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm rounded-sm"
    >
      📥 Export to Excel
    </button>
  );
}