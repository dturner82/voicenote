export default function date(string: string, date: Date | number = new Date()) {
	
	if (typeof date === "number") {
		date = new Date(date * 1000);
	}

	const D = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'],
		l = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		F = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
		S = [
			/* 1 */'st',
			/* 2 */'nd',
			/* 3 */'rd',
			/* 4 */'th',
			/* 5 */'th',
			/* 6 */'th',
			/* 7 */'th',
			/* 8 */'th',
			/* 9 */'th',
			/* 10 */'th',
			/* 11 */'th',
			/* 12 */'th',
			/* 13 */'th',
			/* 14 */'th',
			/* 15 */'th',
			/* 16 */'th',
			/* 17 */'th',
			/* 18 */'th',
			/* 19 */'th',
			/* 20 */'th',
			/* 21 */'st',
			/* 22 */'nd',
			/* 23 */'rd',
			/* 24 */'th',
			/* 25 */'th',
			/* 26 */'th',
			/* 27 */'th',
			/* 28 */'th',
			/* 29 */'th',
			/* 30 */'th',
			/* 31 */'st'
		],
		dateOBJ: Record<string, string | number> = {
			"Y": date.getUTCFullYear(),
			"y": date.getUTCFullYear().toString().slice(-2),
			"m": (date.getMonth() + 1),
			"d": date.getDate(),
			"H": date.getHours(),
			"i": date.getMinutes(),
			"s": date.getSeconds(),
			"u": date.getMilliseconds(),
			"l": l[date.getDay()],
			"D": D[date.getDay()],
			"F": F[date.getMonth()],
			"M": M[date.getMonth()],
			"r": date.valueOf()
		};

	/*
	d - The day of the month (from 01 to 31)
	D - A textual representation of a day (three letters)
	j - The day of the month without leading zeros (1 to 31)
	l (lowercase 'L') - A full textual representation of a day
	N - The ISO-8601 numeric representation of a day (1 for Monday, 7 for Sunday)
	w - A numeric representation of the day (0 for Sunday, 6 for Saturday)
	F - A full textual representation of a month (January through December)
	m - A numeric representation of a month (from 01 to 12)
	M - A short textual representation of a month (three letters)
	n - A numeric representation of a month, without leading zeros (1 to 12)
	Y - A four digit representation of a year
	y - A two digit representation of a year
	g - 12-hour format of an hour (1 to 12)
	G - 24-hour format of an hour (0 to 23)
	h - 12-hour format of an hour (01 to 12)
	H - 24-hour format of an hour (00 to 23)
	i - Minutes with leading zeros (00 to 59)
	s - Seconds, with leading zeros (00 to 59)
	u - Microseconds

	r - valueOf
	*/

	for (const item in dateOBJ) {
		const value = dateOBJ[item];
		if (typeof value === "number" && value < 10) {
			dateOBJ[item] = '0' + value;
		}
	}

	dateOBJ['j'] = date.getDate();
	dateOBJ['S'] = S[date.getDate() - 1];

	const array = string.split('');

	for (let item = 0; item < array.length; item++) {
		const key = array[item];
		if (typeof dateOBJ[key] !== "undefined") {
			array[item] = String(dateOBJ[key]);
		}
	}

	return array.join('');

}