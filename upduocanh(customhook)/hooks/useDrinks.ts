import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDrinks, addDrink, updateDrink, deleteDrink } from '../store';

const API = 'https://67ff3c6458f18d7209f06c43.mockapi.io/onthi';

// Helper: API Call
const apiCall = async (url: string, method: string = 'GET', body: any = null) => {
  const options: any = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  return fetch(url, options).then(res => res.json());
};

export const useDrinks = () => {
  const dispatch = useDispatch();
  const drinks = useSelector((state: any) => state.drinks.items);
  const [loading, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    setLoading(true);
    apiCall(API).then(data => { 
      dispatch(setDrinks(data)); 
      setLoading(false); 
    });
  }, [dispatch]);

  // Tính tổng
  const totalValue = useMemo(() => 
    drinks.reduce((sum: number, item: any) => 
      item.isAvailable ? sum + Number(item.price) : sum, 0
    ), [drinks]
  );

  // Toggle status
  const handleToggle = useCallback((item: any) => {
    dispatch(updateDrink({ ...item, isAvailable: !item.isAvailable }));
    apiCall(`${API}/${item.id}`, 'PUT', { isAvailable: !item.isAvailable });
  }, [dispatch]);

  // Delete item
  const handleDelete = useCallback((item: any) => {
    if (window.confirm(`Xóa "${item.name}"?`)) {
      setLoading(true);
      apiCall(`${API}/${item.id}`, 'DELETE').then(() => {
        dispatch(deleteDrink(item.id));
        setLoading(false);
      });
    }
  }, [dispatch]);

  // Save item (add or update)
  const handleSave = useCallback(async (form: any, imageUrl: string) => {
    const payload = { ...form, price: Number(form.price), image: imageUrl };
    const isEdit = !!form.id;
    
    setLoading(true);
    return apiCall(
      isEdit ? `${API}/${form.id}` : API, 
      isEdit ? 'PUT' : 'POST', 
      payload
    ).then(data => {
      dispatch(isEdit ? updateDrink(data) : addDrink(data));
      setLoading(false);
      return data;
    });
  }, [dispatch]);

  return {
    drinks,
    loading,
    totalValue,
    handleToggle,
    handleDelete,
    handleSave,
  };
};
