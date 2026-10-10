(async () => {
	await new Promise (r => window.onload = r);

	document.onkeydown = e => {
		if (e.key == " ") {
			window.location.reload();
		} else if (e.key == "r") {
			draw();
		} else if (e.key == "ArrowLeft") {
			steps = Math.max(steps - 1, 2);
			draw();
		} else if (e.key == "ArrowRight") {
			steps ++;
			draw();
		} else if (e.key == "c") {
			let p = document.getElementById("picker");
			if (p.classList.contains("transparent")) {
				p.classList.remove("transparent");
			} else {
				p.classList.add("transparent");
			}
		}
	}

	let lerp = (a, b, alpha) => {
		return a + alpha * (b - a);
	}

	let lerp_color = (a, b, alpha) => {
		return [lerp(a[0], b[0], alpha), lerp(a[1], b[1], alpha), lerp(a[2], b[2], alpha)];
	}

	let rgb_to_hex = (rgb) => {
		let hex_code = "#";
		for (let i = 0; i < rgb.length; i ++) {
			hex_code += rgb[i].toString(16).padStart(2, "0");
		}
		return hex_code;
	}

	let hex_to_rgb = (hex) => {
		let r = hex.substr(1,2), g = hex.substr(3,2), b = hex.substr(5,2);
		return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
	}

	let hsv_to_rgb = hsv => {
		let r, g, b, i, f, p, q, t;
		let h = hsv[0];
		let s = hsv[1];
		let v = hsv[2];
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	let rgb_to_hsv = rgb => {
		let r = rgb[0];
		let g = rgb[1];
		let b = rgb[2];
		let max = Math.max(r, g, b), min = Math.min(r, g, b,), d = max - min, h, s = (max == 0 ? 0 : d / max), v = max / 255;
		switch (max) {
			case min: h = 0; break;
			case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
			case g: h = (b - r) + d * 2; h /= 6 * d; break;
			case b: h = (r - g) + d * 4; h /= 6 * d; break;
		}
		//return [Math.floor(h * 255), Math.floor(s * 255), Math.floor(v * 255)];
		return [h, s, v];
	}
	
	/********/

	let color_0 = new Array(3).fill().map(() => Math.floor(Math.random() * 255));
	let color_1 = new Array(3).fill();
	
	let hsv_col1;
	
	let generation_style = Math.floor(Math.random() * 4);

	switch (generation_style) {
		case 0:
			color_1 = color_1.map(() => Math.floor(Math.random() * 255));
			break;
		case 1:
			color_1 = color_0.map(e => 255 - e);
			break;
		case 2:
			hsv_col1 = rgb_to_hsv(color_0);
			hsv_col1[0] += (1 / 6);
			color_1 = hsv_to_rgb(hsv_col1);
			break;
		case 3:
			hsv_col1 = rgb_to_hsv(color_0);
			hsv_col1[0] += (1 / 4);
			color_1 = hsv_to_rgb(hsv_col1);
			break;

	}

	document.getElementById("gen_style").innerText = generation_style;
	
	let update_color_displays = () => {
		document.getElementById("color_0").value = rgb_to_hex(color_0);
		document.getElementById("color_1").value = rgb_to_hex(color_1);
	}

	update_color_displays();
	
	document.getElementById("color_0").onchange = e => {
		color_0 = hex_to_rgb(e.target.value);
		draw();
	}

	document.getElementById("color_1").onchange = e => {
		color_1 = hex_to_rgb(e.target.value);
		draw();
	}
	
	document.getElementById("av_hue").onclick = e => {
		let hsv_0 = rgb_to_hsv(color_0), hsv_1 = rgb_to_hsv(color_1);
		let average = (hsv_0[0] + hsv_1[0]) / 2;
		color_0 = hsv_to_rgb([average, hsv_0[1], hsv_0[2]]);
		color_1 = hsv_to_rgb([average, hsv_1[1], hsv_1[2]]);
		update_color_displays();
		draw();
	}

	document.getElementById("av_sat").onclick = e => {
		let hsv_0 = rgb_to_hsv(color_0), hsv_1 = rgb_to_hsv(color_1);
		let average = (hsv_0[1] + hsv_1[1]) / 2;
		color_0 = hsv_to_rgb([hsv_0[0], average, hsv_0[2]]);
		color_1 = hsv_to_rgb([hsv_1[0], average, hsv_1[2]]);
		update_color_displays();
		draw();
	}

	document.getElementById("av_val").onclick = e => {
		let hsv_0 = rgb_to_hsv(color_0), hsv_1 = rgb_to_hsv(color_1);
		let average = (hsv_0[2] + hsv_1[2]) / 2;
		color_0 = hsv_to_rgb([hsv_0[0], hsv_0[1], average]);
		color_1 = hsv_to_rgb([hsv_1[0], hsv_1[1], average]);
		update_color_displays();
		draw();
	}

	//let color_1 = color_0.map(e => 255 - e);
	
	let steps = Math.floor(Math.random() * 4) + 4;
	let style = ["row", "column"][Math.floor(Math.random() * 2)]

	let invoked = false;
	
	let draw = () => {
		document.getElementById("rows").innerHTML = "";
		document.getElementById("steps").innerText = steps;
		if (invoked) {
			document.styleSheets[0].removeRule(0);
			document.styleSheets[0].removeRule(0);
		} else invoked = true;

		let a = document.styleSheets[0].insertRule(`div.column {
			width: calc(100% / ${steps});
			height: 100%;
		}`);

		let b = document.styleSheets[0].insertRule(`div.row {
			height: calc(100% / ${steps});
			width: 100%;
		}`);
	
		for (let i = 0; i < steps; i ++) {
			let cur_col = lerp_color(color_0, color_1, i / (steps - 1)).map(e => Math.floor(e));
			let hex_code = rgb_to_hex(cur_col);
			document.getElementById("rows").innerHTML += `<div class="${style}" style="background-color: rgb(${cur_col[0]} ${cur_col[1]} ${cur_col[2]});"><a>${hex_code}<a></div>`
		}
	}

	draw();
})();
