const fs = require('fs');
const path = require('path');

const nameMap = {
	monuments: 'Памятники',
	vertical: 'Вертикальные',
	horizontal: 'Горизонтальные',
	design: 'Оформление',
	crosses: 'Кресты',
	flowers: 'Цветы',
	candles: 'Свечи',
	reverse: 'Оборот',
};

const baseDir = path.join(__dirname, '../public/images');
const outputFile = path.join(__dirname, '../public/data.json');

function translateName(name) {
	return nameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Формирует ID подкатегории
 * @param {number} categoryId — id родительской категории (1,2,3,...)
 * @param {number} subIndex — порядковый номер подкатегории (1,2,...)
 * @returns {number} например 2001
 */
function makeSubcategoryId(categoryId, subIndex) {
	return categoryId * 1000 + subIndex;
}

/**
 * Формирует ID элемента
 * @param {number} subcategoryId — id родительской подкатегории (2001,...)
 * @param {number} itemIndex — порядковый номер элемента
 * @returns {number} например 2001001
 */
function makeItemId(subcategoryId, itemIndex) {
	return subcategoryId * 1000 + itemIndex;
}

function walkDir(dir, categoryId, categoryTitle) {
	const subcategories = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	
	let subIndex = 1;
	for (const entry of entries) {
		if (entry.isDirectory()) {
			const subDir = path.join(dir, entry.name);
			const files = fs.readdirSync(subDir)
				.filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
			
			const subcategoryId = makeSubcategoryId(categoryId, subIndex++);
			const items = files.map((file, idx) => ({
				id: makeItemId(subcategoryId, idx + 1),
				title: path.parse(file).name,
				image: `/catalog-app/images/${categoryTitle}/${entry.name}/${file}`
			}));
			
			subcategories.push({
				id: subcategoryId,
				title: translateName(entry.name),
				items
			});
		}
	}
	
	return subcategories;
}

function generateData() {
	const categories = [];
	const categoryDirs = fs.readdirSync(baseDir, { withFileTypes: true });
	
	let categoryIndex = 1;
	for (const dir of categoryDirs) {
		if (dir.isDirectory()) {
			const categoryId = categoryIndex++;
			const categoryPath = path.join(baseDir, dir.name);
			const subcategories = walkDir(categoryPath, categoryId, dir.name);
			
			categories.push({
				id: categoryId,
				title: translateName(dir.name),
				subcategories
			});
		}
	}
	
	fs.writeFileSync(outputFile, JSON.stringify(categories, null, 2), 'utf-8');
	console.log(`✅ data.json сгенерирован: ${outputFile}`);
}

generateData();