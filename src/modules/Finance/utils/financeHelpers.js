export const CURRENCIES = {
    AMD: { symbol: '֏', label: 'AMD', rate: 1 },
    USD: { symbol: '$', label: 'USD', rate: 0.0025 },
    EUR: { symbol: '€', label: 'EUR', rate: 0.0023 },
    RUB: { symbol: '₽', label: 'RUB', rate: 0.24 }
};

export const getLocalYYYYMMDD = (dateOrStr) => {
    const d = dateOrStr ? new Date(dateOrStr) : new Date();
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

export const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    } else if (parts.length === 2) {
        return `01.${parts[1]}.${parts[0]}`;
    }
    return dateString;
};
