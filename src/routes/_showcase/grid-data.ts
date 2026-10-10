/**
 * Deterministic people/company rows for the data grid showcase, shaped like
 * SVAR Grid's demo data so the big-data demo compares like for like.
 */
import type { GridColumn } from '@chienleng/stratum-ui/grid';
import { mulberry32 } from './demo-data.js';

export interface Person {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	companyName: string;
	city: string;
	country: string;
	street: string;
	zipCode: string;
	date: Date;
	stars: number;
	followers: number;
}

const FIRST = [
	'Ada',
	'Grace',
	'Alan',
	'Linus',
	'Margaret',
	'Dennis',
	'Barbara',
	'Ken',
	'Radia',
	'Tim',
	'Frances',
	'Edsger'
];
const LAST = [
	'Lovelace',
	'Hopper',
	'Turing',
	'Torvalds',
	'Hamilton',
	'Ritchie',
	'Liskov',
	'Thompson',
	'Perlman',
	'Berners-Lee',
	'Allen',
	'Dijkstra'
];
const COMPANIES = [
	'Northwind',
	'Contoso',
	'Initech',
	'Globex',
	'Umbrella',
	'Hooli',
	'Stark',
	'Wayne',
	'Tyrell',
	'Soylent'
];
const PLACES: [string, string][] = [
	['Sydney', 'Australia'],
	['Melbourne', 'Australia'],
	['Auckland', 'New Zealand'],
	['London', 'United Kingdom'],
	['Berlin', 'Germany'],
	['Toronto', 'Canada'],
	['Tokyo', 'Japan'],
	['Lisbon', 'Portugal']
];
const STREETS = ['High St', 'Station Rd', 'Church Ln', 'Park Ave', 'Mill Rd', 'Victoria St'];

/** `count` people from a fixed seed: the same rows every time. */
export function repeatData(count: number, seed = 7): Person[] {
	const rand = mulberry32(seed);
	const pick = <V>(list: readonly V[]) => list[Math.floor(rand() * list.length)];
	const start = Date.UTC(2015, 0, 1);
	const rows = new Array<Person>(count);
	for (let i = 0; i < count; i++) {
		const firstName = pick(FIRST);
		const lastName = pick(LAST);
		const companyName = pick(COMPANIES);
		const [city, country] = pick(PLACES);
		rows[i] = {
			id: i + 1,
			firstName,
			lastName,
			email: `${firstName}.${lastName}${i}@${companyName}.example`.toLowerCase(),
			companyName,
			city,
			country,
			street: `${1 + Math.floor(rand() * 300)} ${pick(STREETS)}`,
			zipCode: String(1000 + Math.floor(rand() * 9000)),
			date: new Date(start + Math.floor(rand() * 3650) * 86_400_000),
			stars: Math.floor(rand() * 6),
			followers: Math.floor(rand() ** 3 * 50_000)
		};
	}
	return rows;
}

const dateFormat = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeZone: 'UTC' });
const numberFormat = new Intl.NumberFormat('en-AU');

export const formatDate = (value: unknown) =>
	value instanceof Date ? dateFormat.format(value) : '';
export const formatNumber = (value: unknown) =>
	typeof value === 'number' ? numberFormat.format(value) : '';

const BASE_COLUMNS: GridColumn<Person>[] = [
	{ id: 'id', header: 'ID', width: 80, align: 'end' },
	{ id: 'firstName', header: 'First name', width: 130 },
	{ id: 'lastName', header: 'Last name', width: 130 },
	{ id: 'email', header: 'Email', width: 260 },
	{ id: 'companyName', header: 'Company', width: 140 },
	{ id: 'city', header: 'City', width: 130 },
	{ id: 'country', header: 'Country', width: 150 },
	{ id: 'date', header: 'Joined', width: 130, format: formatDate },
	{ id: 'followers', header: 'Followers', width: 120, align: 'end', format: formatNumber }
];

/** `count` columns: the base set, then repeats that read the same fields under new ids. */
export function repeatColumns(count: number): GridColumn<Person>[] {
	return Array.from({ length: count }, (_, i) => {
		const base = BASE_COLUMNS[i % BASE_COLUMNS.length];
		const round = Math.floor(i / BASE_COLUMNS.length);
		if (round === 0) return base;
		const field = base.id as keyof Person;
		return {
			...base,
			id: `${base.id}_${round}`,
			header: `${base.header} ${round + 1}`,
			value: (row: Person) => row[field]
		};
	});
}
