import api from './api';

/**
 * Mengunduh file laporan dalam format PDF
 * @param {Object} filters - Filter laporan (start_date, end_date, status)
 */
export async function exportBorrowingsPdf(filters = {}) {
    const response = await api.get('/reports/borrowings/pdf', {
        params: filters,
        responseType: 'blob', // Penting agar axios menangani file biner dengan benar
    });
    
    // Membuat URL sementara untuk Blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'laporan-peminjaman.pdf');
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Mengunduh file laporan dalam format Excel
 * @param {Object} filters - Filter laporan (start_date, end_date, status)
 */
export async function exportBorrowingsExcel(filters = {}) {
    const response = await api.get('/reports/borrowings/excel', {
        params: filters,
        responseType: 'blob', // Penting untuk file biner (Excel)
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'laporan-peminjaman.xlsx');
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
}
