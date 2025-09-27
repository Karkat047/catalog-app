import React, { useState, useEffect } from 'react';
import './Catalog.css';

export const Catalog = () => {
	const [data, setData] = useState([]);
	const [currentCategory, setCurrentCategory] = useState(null);
	const [currentSubcategory, setCurrentSubcategory] = useState(null);
	
	useEffect(() => {
		fetch('/data.json')
			.then(response => response.json())
			.then(setData);
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
								<div key={item.id} className="item-card">
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
						<div key={item.id} className="item-card">
							<img src={item.image} alt={item.title} className="item-image" />
							<h4>{item.title}</h4>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
