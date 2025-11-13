import React, { useState, useEffect } from 'react';
import './Catalog.css';

export const Catalog = () => {
	const [data, setData] = useState([]);
	const [currentCategory, setCurrentCategory] = useState(null);
	const [currentSubcategory, setCurrentSubcategory] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [modalImageSrc, setModalImageSrc] = useState('');
	const [modalImageAlt, setModalImageAlt] = useState('');

	useEffect(() => {
		fetch('/catalog-app/data.json')
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(fetchedData => {
				setData(fetchedData);
				setLoading(false);
				setError(null);
			})
			.catch(err => {
				console.error("Ошибка при загрузке данных каталога:", err);
				setError(err.message);
				setLoading(false);
			});
		
	}, []);

	const handleCategoryClick = (category) => {
		setCurrentCategory(category);
	};

	const handleSubcategoryClick = (subcategory) => {
		setCurrentSubcategory(subcategory);
	};

	const handleBackClick = () => {
		if (currentSubcategory) {
			setCurrentSubcategory(null);
		} else if (currentCategory) {
			setCurrentCategory(null);
		}
	};

	const handleItemImageClick = (item) => {
		setModalImageSrc(item.image); // Предполагается, что у объекта item есть свойство image
		setModalImageAlt(item.title || ''); // Используем заголовок как alt, если он есть
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setModalImageSrc('');
		setModalImageAlt('');
	};

	if (loading) {
		return <h1 className="loading">Загрузка каталога...</h1>;
	}
	
	if (error && data.length === 0) {
		return (
			<div className="error-container">
				<h2>Не удалось загрузить данные каталога.</h2>
				<h3>Проверьте подключение к интернету и обновите страницу.</h3>
			</div>
		);
	}

	return (
		<div className="catalog-container">
			<div className="header">
				<button
					onClick={handleBackClick}
					className="back-button"
					style={{ display: currentCategory || currentSubcategory ? 'block' : 'none' }}
				>
					← Назад
				</button>
				<h1 className="title">
					{currentSubcategory
						? currentSubcategory.title
						: currentCategory
							? currentCategory.title
							: 'Каталог'}
				</h1>
			</div>

			{!currentCategory && !currentSubcategory && (
				<div className="grid">
					{data.map(cat => (
						<div
							key={cat.id}
							className="card"
							onClick={() => handleCategoryClick(cat)}
						>
							<h3>{cat.title}</h3>
						</div>
					))}
				</div>
			)}

			{currentCategory && !currentSubcategory && (
				<div className="grid">
					{currentCategory.subcategories.length > 0 ? (
						currentCategory.subcategories.map(sub => (
							<div
								key={sub.id}
								className="card"
								onClick={() => handleSubcategoryClick(sub)}
							>
								<h3>{sub.title}</h3>
							</div>
						))
					) : (
						<div className="grid">
							{currentCategory.items && currentCategory.items.map(item => (
								<div
									key={item.id}
									className="item-card"
									onClick={() => handleItemImageClick(item)}
								>
									<img src={item.image} alt={item.title} className="item-image" />
									<h4>{item.title}</h4>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{currentSubcategory && (
				<div className="grid">
					{currentSubcategory.items.map(item => (
						<div key={item.id}
						     className="item-card"
						     onClick={() => handleItemImageClick(item)}
						>
							<img src={item.image} alt={item.title} className="item-image" />
							<h4>{item.title}</h4>
						</div>
					))}
				</div>
			)}
			
			{modalOpen && (
				<div className="modal-overlay" onClick={closeModal}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Останавливаем всплытие, чтобы клик на изображение не закрывал модалку */}
						<img
							src={modalImageSrc}
							alt={modalImageAlt}
							className="modal-image"
							onClick={closeModal} // Клик на изображение закрывает модалку
						/>
					</div>
				</div>
			)}
		</div>
	);
};
