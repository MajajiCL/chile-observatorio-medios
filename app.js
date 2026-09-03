/* ===========================================================================
   Brecha Territorial — Observatorio Cívico de Chile
   Sin dependencias externas: la geometría llega ya proyectada desde el build
   y el análisis viene precalculado, así que aquí sólo se pinta y se navega.

   Nota sobre CSP: la política declarada no admite 'unsafe-inline' en estilos,
   de modo que ningún color se escribe como atributo style dentro de innerHTML.
   Los colores del mapa van como atributo de presentación SVG (fill) y el resto
   se aplica por CSSOM después de insertar el nodo.
   =========================================================================== */
(function () {
  'use strict';

  var MAPA = null, CORE = null;
  var capaActiva = 0;
  var seleccion = null;       // código de comuna seleccionada
  var pares = [];             // códigos del grupo de pares en pantalla
  var indexComunas = {};      // code -> metadatos
  var catalogo = {};          // code indicador -> metadatos
  var nodos = {};             // code comuna -> [elementos SVG]
  var fichaCache = {};
  var HALLAZGOS = null;
  var MZ_CAPAS = null;
  var mzDatos = null;
  var mzCapa = 'hac';
  var mzCache = {};
  var vistaHallazgos = false;

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- escala divergente ---------- */
  var PASOS = [
    { max: -1.5, v: '--g-neg-4' },
    { max: -0.8, v: '--g-neg-3' },
    { max: -0.35, v: '--g-neg-2' },
    { max: -0.12, v: '--g-neg-1' },
    { max: 0.12, v: '--g-zero' },
    { max: 0.35, v: '--g-pos-1' },
    { max: 0.8, v: '--g-pos-2' },
    { max: 1.5, v: '--g-pos-3' },
    { max: Infinity, v: '--g-pos-4' }
  ];

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function colorBrecha(z) {
    if (z === null || z === undefined || isNaN(z)) return cssVar('--g-null');
    for (var i = 0; i < PASOS.length; i++) {
      if (z <= PASOS[i].max) return cssVar(PASOS[i].v);
    }
    return cssVar('--g-null');
  }

  /* Capas de contexto: no tienen brecha, se pintan por posición relativa.
     Se usa rango intercuartílico para que un outlier no aplaste la escala. */
  var escalaCtx = null;
  function prepararEscalaCtx(capa) {
    var vals = Object.keys(capa.values).map(function (k) { return capa.values[k]; })
      .filter(function (v) { return v !== null && !isNaN(v); })
      .sort(function (a, b) { return a - b; });
    if (!vals.length) { escalaCtx = null; return; }
    var q = function (p) { return vals[Math.min(vals.length - 1, Math.floor(p * vals.length))]; };
    escalaCtx = { lo: q(0.05), hi: q(0.95), inv: capa.direction === 'lower_better' };
  }

  function colorContexto(v) {
    if (v === null || v === undefined || isNaN(v) || !escalaCtx) return cssVar('--g-null');
    var t = (v - escalaCtx.lo) / ((escalaCtx.hi - escalaCtx.lo) || 1);
    t = Math.max(0, Math.min(1, t));
    if (escalaCtx.inv) t = 1 - t;
    var idx = Math.round(t * 8);            // 0..8 sobre la misma rampa divergente
    return cssVar(PASOS[idx].v);
  }

  /* La brecha que se publica es la contraida por tamano: en comunas muy
     pequenas el residuo crudo es mayormente azar. */
  function brecha(g) {
    if (!g) return null;
    return (g.zs !== undefined && g.zs !== null) ? g.zs : g.z;
  }

  function fmt(v, unidad) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    var s;
    if (Math.abs(v) >= 1000000) s = (v / 1000000).toFixed(1).replace('.', ',') + 'M';
    else if (Math.abs(v) >= 1000) s = Math.round(v).toLocaleString('es-CL');
    else if (Math.abs(v) >= 100) s = Math.round(v).toString();
    else s = v.toFixed(1).replace('.', ',');
    if (unidad === '%') return s + '%';
    if (unidad === 'CLP') return '$' + s;
    return s;
  }

  /* ---------- construcción del mapa ---------- */
  function pintarMapa() {
    var cont = $('tramos');
    cont.textContent = '';
    nodos = {};

    MAPA.tramos.forEach(function (t) {
      var wrap = document.createElement('div');
      wrap.className = 'tramo';

      var hd = document.createElement('div');
      hd.className = 'tramo-hd';
      var b = document.createElement('b'); b.textContent = t.label;
      var s = document.createElement('span'); s.textContent = t.sub;
      hd.appendChild(b); hd.appendChild(s);
      wrap.appendChild(hd);

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 ' + t.w + ' ' + t.h);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Comunas del tramo ' + t.label);

      t.comunas.forEach(function (c) {
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', c.d);
        p.setAttribute('class', 'comuna');
        p.setAttribute('data-c', c.c);
        p.setAttribute('tabindex', '-1');
        var ttl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        ttl.textContent = c.n || c.c;
        p.appendChild(ttl);
        svg.appendChild(p);
        (nodos[c.c] = nodos[c.c] || []).push(p);
      });

      // contornos regionales por encima de las comunas
      Object.keys(t.regiones).forEach(function (rid) {
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', t.regiones[rid]);
        p.setAttribute('class', 'region-line');
        svg.appendChild(p);
      });

      wrap.appendChild(svg);
      cont.appendChild(wrap);
    });

    // Rapa Nui y Juan Fernández, fuera de escala por estar a 3.500 km
    var ins = $('insets');
    ins.textContent = '';
    MAPA.insulares.forEach(function (i) {
      var box = document.createElement('div');
      box.className = 'inset-box';
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 ' + i.w + ' ' + i.h);
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', i.d);
      p.setAttribute('class', 'comuna');
      p.setAttribute('data-c', i.c);
      svg.appendChild(p);
      (nodos[i.c] = nodos[i.c] || []).push(p);
      var lb = document.createElement('small');
      lb.textContent = i.n;
      box.appendChild(svg); box.appendChild(lb);
      ins.appendChild(box);
    });
  }

  /* ---------- coloreado según capa ---------- */
  function aplicarCapa() {
    var capa = CORE.layers[capaActiva];
    var usaBrecha = !capa.context_only && capa.gaps && Object.keys(capa.gaps).length;

    if (!usaBrecha) prepararEscalaCtx(capa);

    Object.keys(nodos).forEach(function (code) {
      var color;
      if (usaBrecha) {
        color = colorBrecha(brecha(capa.gaps[code]));
      } else {
        color = colorContexto(capa.values[code]);
      }
      nodos[code].forEach(function (n) { n.setAttribute('fill', color); });
    });

    $('q-title').textContent = capa.question;
    var det = capa.name + ' · ' + capa.year;
    if (usaBrecha && capa.r2 !== null && capa.r2 !== undefined) {
      det += ' · el contexto explica el ' + Math.round(capa.r2 * 100) + '% de este indicador';
    }
    if (capa.context_only) {
      det += ' · indicador de contexto: se muestra el valor, no la brecha';
    }
    $('q-sub').textContent = det;

    $('lg-lo').textContent = usaBrecha ? 'Bajo lo esperado' : 'Peor';
    $('lg-hi').textContent = usaBrecha ? 'Sobre lo esperado' : 'Mejor';

    var src = $('src');
    src.textContent = '';
    var t1 = document.createTextNode('Fuente: ');
    src.appendChild(t1);
    if (capa.source_url) {
      var a = document.createElement('a');
      a.href = capa.source_url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = capa.source;
      src.appendChild(a);
    } else {
      src.appendChild(document.createTextNode(capa.source));
    }
    src.appendChild(document.createTextNode(' · datos ' + capa.year));

    marcarSeleccion();
    if (!seleccion && !vistaHallazgos) panelPais();
  }

  function pintarEscala() {
    var sc = $('scale');
    sc.textContent = '';
    PASOS.forEach(function (p) {
      var i = document.createElement('i');
      i.style.background = cssVar(p.v);      // CSSOM: no lo bloquea la CSP
      sc.appendChild(i);
    });
  }

  /* ---------- selección ---------- */
  function marcarSeleccion() {
    var hayPares = pares.length > 0;
    Object.keys(nodos).forEach(function (code) {
      nodos[code].forEach(function (n) {
        n.classList.toggle('is-sel', code === seleccion);
        n.classList.toggle('is-peer', hayPares && pares.indexOf(code) >= 0);
        n.classList.toggle('is-dim', hayPares && code !== seleccion && pares.indexOf(code) < 0);
      });
    });
  }

  /* ---------- panel: vista país ---------- */
  function panelPais() {
    var capa = CORE.layers[capaActiva];
    var p = $('panel');
    p.textContent = '';

    var hd = document.createElement('div');
    hd.className = 'panel-hd';
    var eb = document.createElement('div'); eb.className = 'eyebrow'; eb.textContent = capa.label;
    var h2 = document.createElement('h2'); h2.textContent = capa.name;
    var mt = document.createElement('div'); mt.className = 'meta';
    hd.appendChild(eb); hd.appendChild(h2); hd.appendChild(mt);
    p.appendChild(hd);

    var usaBrecha = !capa.context_only && capa.gaps && Object.keys(capa.gaps).length;

    if (!usaBrecha) {
      mt.textContent = 'Indicador de contexto. Describe la situación de la comuna, no su desempeño, así que no admite brecha.';
      listaValores(p, capa);
      p.appendChild(nota('Este indicador es uno de los que el modelo usa para predecir a los demás. Calcular su propia brecha sería circular.'));
      return;
    }

    var codes = Object.keys(capa.gaps);
    mt.textContent = '';
    var bm = document.createElement('b'); bm.textContent = codes.length + ' comunas';
    mt.appendChild(bm);
    mt.appendChild(document.createTextNode(' con datos suficientes · promedio nacional ' + fmt(capa.avg, capa.unit)));

    var orden = codes.slice().sort(function (a, b) {
      return brecha(capa.gaps[b]) - brecha(capa.gaps[a]);
    });

    seccion(p, 'Rinden sobre lo que su contexto predice');
    filas(p, orden.slice(0, 8), capa);

    seccion(p, 'Rinden bajo lo que su contexto predice');
    filas(p, orden.slice(-8).reverse(), capa);

    p.appendChild(nota(
      'La brecha no es el valor del indicador. Es cuánto se aparta del resultado que predicen el tamaño, la ruralidad, el ingreso y la pobreza de esa misma comuna. ' +
      'Una comuna pobre puede tener brecha positiva, y una rica brecha negativa. ' +
      'Las brechas están contraídas según la población: en una comuna de pocos cientos de habitantes una tasa se mueve por azar, y este ranking no la premia ni la castiga por eso.'
    ));
  }

  function listaValores(p, capa) {
    var codes = Object.keys(capa.values);
    var mejorArriba = capa.direction !== 'lower_better';
    codes.sort(function (a, b) {
      return mejorArriba ? capa.values[b] - capa.values[a] : capa.values[a] - capa.values[b];
    });
    seccion(p, 'Extremos');
    filas(p, codes.slice(0, 6), capa);
    filas(p, codes.slice(-6).reverse(), capa);
  }

  function seccion(p, txt) {
    var d = document.createElement('div');
    d.className = 'section-t';
    d.textContent = txt;
    p.appendChild(d);
  }

  function nota(txt) {
    var d = document.createElement('div');
    d.className = 'note';
    d.textContent = txt;
    return d;
  }

  function filas(p, codes, capa) {
    var box = document.createElement('div');
    box.className = 'rows';
    codes.forEach(function (code) {
      var meta = indexComunas[code];
      if (!meta) return;
      var g = capa.gaps ? capa.gaps[code] : null;

      var b = document.createElement('button');
      b.className = 'row-i';
      b.setAttribute('data-c', code);

      var l = document.createElement('span'); l.className = 'lbl'; l.textContent = meta.n;
      var v = document.createElement('span'); v.className = 'val';
      v.textContent = fmt(capa.values[code], capa.unit);
      var s = document.createElement('span'); s.className = 'sub';
      s.textContent = meta.rn;

      b.appendChild(l); b.appendChild(v); b.appendChild(s);

      var z = brecha(g);
      if (z !== null) {
        var c = document.createElement('span');
        c.className = 'chip ' + (z > 0.12 ? 'pos' : z < -0.12 ? 'neg' : 'mid');
        c.textContent = (z > 0 ? '+' : '') + z.toFixed(2) + ' σ';
        s.appendChild(document.createTextNode('  ·  '));
        s.appendChild(c);
      }
      if (meta.pop) {
        s.appendChild(document.createTextNode('  ·  ' + meta.pop.toLocaleString('es-CL') + ' hab.'));
      }
      box.appendChild(b);
    });
    p.appendChild(box);
  }

  /* ---------- vista de manzanas ----------
     El cuarto nivel de zoom. A escala comunal Chile parece dos paises; a escala
     de manzana se ve que dentro de una misma comuna hay cuadras sin agua de red
     a metros de cuadras con fibra optica. Los archivos se cargan solo al entrar
     a una comuna: el pais entero pesaria cientos de megabytes. */

  var RAMPA_MAL = ['--g-neg-1', '--g-neg-2', '--g-neg-3', '--g-neg-4'];
  var RAMPA_BIEN = ['--g-pos-1', '--g-pos-2', '--g-pos-3', '--g-pos-4'];

  function escalaManzana(valores) {
    /* Cortes por cuantiles y no en tramos fijos: la mayoria de las manzanas
       marca cero en carencias y una escala lineal las pintaria todas iguales. */
    var v = valores.filter(function (x) {
      return x !== null && x !== undefined && !isNaN(x);
    }).sort(function (a, b) { return a - b; });
    if (v.length < 8) return null;
    var cortes = [];
    for (var i = 1; i < 8; i++) cortes.push(v[Math.floor(v.length * i / 8)]);
    return cortes;
  }

  function colorManzana(v, cortes, dir) {
    if (v === null || v === undefined || isNaN(v) || !cortes) return cssVar('--g-null');
    var i = 0;
    while (i < cortes.length && v > cortes[i]) i++;
    if (i < 2) return cssVar('--g-zero');
    var idx = Math.min(3, Math.floor((i - 2) / 1.6));
    return cssVar(dir === 'menos' ? RAMPA_MAL[idx] : RAMPA_BIEN[idx]);
  }

  function capaManzanaActual() {
    var cs = (MZ_CAPAS && MZ_CAPAS.capas) || [];
    for (var i = 0; i < cs.length; i++) if (cs[i].k === mzCapa) return cs[i];
    return cs[0];
  }

  function pintarManzanas() {
    if (!mzDatos) return;
    var capa = capaManzanaActual();
    if (!capa) return;

    var vals = mzDatos.mz.map(function (m) { return m[mzCapa]; });
    var cortes = escalaManzana(vals);

    var wrap = $('mzwrap');
    wrap.textContent = '';
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + mzDatos.w + ' ' + mzDatos.h);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Manzanas censales de la comuna');

    mzDatos.mz.forEach(function (m) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', m.d);
      p.setAttribute('class', 'mz');
      p.setAttribute('fill', colorManzana(m[mzCapa], cortes, capa.dir));
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      var val = m[mzCapa];
      var txt = (val === undefined || val === null)
        ? capa.n + ': sin dato'
        : capa.n + ': ' + String(val).replace('.', ',') + (capa.u === '%' ? '%' : ' ' + capa.u);
      t.textContent = txt + '  |  ' + m.p + ' hab., ' + m.h + ' hogares';
      p.appendChild(t);
      svg.appendChild(p);
    });
    wrap.appendChild(svg);

    var conDato = vals.filter(function (x) {
      return x !== undefined && x !== null;
    }).length;
    $('mz-sub').textContent =
      mzDatos.mz.length.toLocaleString('es-CL') + ' manzanas · ' +
      conDato.toLocaleString('es-CL') + ' con dato · ' + capa.n +
      ' · Censo 2024 (INE)';

    $('lg-lo').textContent = capa.dir === 'menos' ? 'Sin el problema' : 'Menor';
    $('lg-hi').textContent = capa.dir === 'menos' ? 'Más afectado' : 'Mayor';
  }

  function abrirManzanas(code) {
    var meta = indexComunas[code];
    if (!meta || !MZ_CAPAS) return;

    var mostrar = function (d) {
      mzDatos = d;
      $('mz-tit').textContent = meta.n;
      $('mzbar').hidden = false;
      $('mzstage').classList.add('on');
      $('stage').classList.add('off');
      $('layers').hidden = true;
      $('question').hidden = true;
      pintarManzanas();
    };

    if (mzCache[code]) { mostrar(mzCache[code]); return; }
    fetch('./data/app/manzana/' + encodeURIComponent(code) + '.json')
      .then(function (r) { if (!r.ok) throw new Error('sin manzanas'); return r.json(); })
      .then(function (d) { mzCache[code] = d; mostrar(d); })
      .catch(function () {
        $('panel').appendChild(nota(
          'Esta comuna todavía no tiene el detalle por manzana disponible.'));
      });
  }

  function cerrarManzanas() {
    mzDatos = null;
    $('mzbar').hidden = true;
    $('mzstage').classList.remove('on');
    $('stage').classList.remove('off');
    $('layers').hidden = false;
    $('question').hidden = false;
    aplicarCapa();
  }

  /* ---------- panel: hallazgos ---------- */
  function panelHallazgos() {
    var p = $('panel');
    p.textContent = '';

    var hd = document.createElement('div');
    hd.className = 'panel-hd';
    var eb = document.createElement('div'); eb.className = 'eyebrow';
    eb.textContent = 'Revisión automática';
    var h2 = document.createElement('h2'); h2.textContent = 'Qué se sale de lo esperado';
    var mt = document.createElement('div'); mt.className = 'meta';
    mt.textContent = HALLAZGOS.revisadas.toLocaleString('es-CL') + ' cifras revisadas · ' +
      HALLAZGOS.sobre_umbral.toLocaleString('es-CL') + ' se apartan más de ' +
      HALLAZGOS.umbral_z + 'σ · se muestran las ' + HALLAZGOS.hallazgos.length + ' más relevantes';
    hd.appendChild(eb); hd.appendChild(h2); hd.appendChild(mt);
    p.appendChild(hd);

    var box = document.createElement('div');
    box.className = 'rows';
    HALLAZGOS.hallazgos.forEach(function (h) {
      var b = document.createElement('button');
      b.className = 'hz';
      b.setAttribute('data-c', h.comuna);

      var top = document.createElement('div'); top.className = 'hz-top';
      var nm = document.createElement('span'); nm.className = 'hz-com'; nm.textContent = h.nombre;
      var tg = document.createElement('span');
      tg.className = 'hz-tag ' + h.tipo;
      tg.textContent = h.tipo === 'atipico' ? 'atípico'
        : (h.z > 0 ? '+' : '') + h.z.toFixed(1) + 'σ';
      top.appendChild(nm); top.appendChild(tg);

      var ind = document.createElement('div'); ind.className = 'hz-ind';
      ind.textContent = h.ind_nombre;

      var cif = document.createElement('div'); cif.className = 'hz-cif';
      var vb = document.createElement('b');
      vb.textContent = fmt(h.valor, h.unit) + (h.unit && h.unit !== '%' ? ' ' + h.unit : '');
      cif.appendChild(vb);
      cif.appendChild(document.createTextNode('   ·   esperado ' + fmt(h.esperado, h.unit)));

      var src = document.createElement('div'); src.className = 'hz-src';
      src.textContent = h.region + ' · ' + h.fuente + ' · ' + h.year;

      b.appendChild(top); b.appendChild(ind); b.appendChild(cif); b.appendChild(src);
      box.appendChild(b);
    });
    p.appendChild(box);

    p.appendChild(nota(
      'El sistema recorre cada indicador en cada comuna y compara con lo que predice su contexto. ' +
      'Se descartan los indicadores que el modelo apenas explica, las desviaciones se contraen según la población ' +
      'y se limita a dos hallazgos por comuna para que un solo caso raro no copie la lista. ' +
      'Los rasgos de identidad —religión, pueblos originarios, afrodescendencia— quedan fuera a propósito: ' +
      'describen a una comuna, no señalan un problema.'
    ));
  }

  /* ---------- panel: ficha de comuna ---------- */
  function abrirComuna(code) {
    vistaHallazgos = false;
    pintarBotonesCapa();
    seleccion = code;
    if (fichaCache[code]) { pintarFicha(fichaCache[code]); return; }

    fetch('./data/app/comuna/' + encodeURIComponent(code) + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('sin ficha');
        return r.json();
      })
      .then(function (f) { fichaCache[code] = f; pintarFicha(f); })
      .catch(function () {
        var p = $('panel');
        p.textContent = '';
        p.appendChild(nota('No hay ficha disponible para esta comuna.'));
      });
  }

  function pintarFicha(f) {
    pares = (f.peers || []).map(function (x) { return x.c; });
    marcarSeleccion();

    var capa = CORE.layers[capaActiva];
    var p = $('panel');
    p.textContent = '';

    var back = document.createElement('button');
    back.className = 'back';
    back.textContent = '← Volver a la vista nacional';
    back.addEventListener('click', function () {
      seleccion = null; pares = []; marcarSeleccion(); panelPais();
    });
    p.appendChild(back);

    var hd = document.createElement('div');
    hd.className = 'panel-hd';
    var eb = document.createElement('div'); eb.className = 'eyebrow'; eb.textContent = f.rn;
    var h2 = document.createElement('h2'); h2.textContent = f.n;
    var mt = document.createElement('div'); mt.className = 'meta';
    mt.textContent = (f.p ? 'Provincia de ' + f.p + ' · ' : '') +
      (f.pop ? f.pop.toLocaleString('es-CL') + ' habitantes' : '');
    hd.appendChild(eb); hd.appendChild(h2); hd.appendChild(mt);
    p.appendChild(hd);

    // brecha en la capa activa
    var g = capa.gaps && capa.gaps[f.c];
    var zf = brecha(g);
    if (zf !== null) {
      var big = document.createElement('div');
      big.className = 'gapbig';
      var n = document.createElement('div');
      n.className = 'n mono';
      n.textContent = (zf > 0 ? '+' : '') + zf.toFixed(2) + 'σ';
      n.style.color = cssVar(zf > 0.12 ? '--g-pos-4' : zf < -0.12 ? '--g-neg-4' : '--muted');
      var t = document.createElement('div');
      t.className = 't';
      t.textContent = capa.name + ': ' + fmt(capa.values[f.c], capa.unit) +
        '. Su contexto predecía ' + fmt(g.e, capa.unit) + '.';
      big.appendChild(n); big.appendChild(t);
      p.appendChild(big);

      if (g.w !== undefined && g.w < 0.5) {
        p.appendChild(nota('Comuna pequeña: la brecha se muestra contraída hacia cero porque con esta población el indicador es estadísticamente inestable. Sin contraer sería ' +
          (g.z > 0 ? '+' : '') + g.z.toFixed(2) + 'σ.'));
      }
    }

    // acceso al detalle por manzana
    if (MZ_CAPAS) {
      var bm = document.createElement('button');
      bm.className = 'layer-btn destacado';
      bm.textContent = 'Ver ' + f.n + ' cuadra por cuadra';
      bm.setAttribute('data-manzana', f.c);
      p.appendChild(bm);
    }

    // grupo de pares
    if (f.peers && f.peers.length) {
      seccion(p, 'Comunas comparables');
      var pw = document.createElement('div');
      pw.className = 'peers';
      f.peers.forEach(function (x) {
        var b = document.createElement('button');
        b.textContent = x.n;
        b.setAttribute('data-c', x.c);
        pw.appendChild(b);
      });
      p.appendChild(pw);
      p.appendChild(nota('Las ' + f.peers.length + ' comunas más parecidas a ' + f.n +
        ' en población, densidad, ruralidad, ingreso y pobreza. Están resaltadas en el mapa.'));
    }

    // indicadores por categoría
    var porCat = {};
    (f.ind || []).forEach(function (r) {
      var meta = catalogo[r.c];
      if (!meta) return;
      (porCat[meta.cat] = porCat[meta.cat] || []).push(r);
    });

    Object.keys(porCat).sort().forEach(function (cat) {
      seccion(p, cat.replace(/_/g, ' '));
      var box = document.createElement('div');
      box.className = 'rows';
      porCat[cat].forEach(function (r) {
        var meta = catalogo[r.c];
        var row = document.createElement('div');
        row.className = 'row-i';

        var l = document.createElement('span'); l.className = 'lbl'; l.textContent = meta.n;
        var v = document.createElement('span'); v.className = 'val';
        v.textContent = fmt(r.v, meta.u);
        var s = document.createElement('span'); s.className = 'sub';
        s.textContent = meta.y + ' · ' + (meta.src || '');

        row.appendChild(l); row.appendChild(v); row.appendChild(s);

        if (r.z !== undefined) {
          var c = document.createElement('span');
          c.className = 'chip ' + (r.z > 0.12 ? 'pos' : r.z < -0.12 ? 'neg' : 'mid');
          c.textContent = (r.z > 0 ? '+' : '') + r.z.toFixed(2) + ' σ';
          s.appendChild(document.createTextNode('  ·  '));
          s.appendChild(c);
        }

        // posición dentro del grupo de pares
        if (r.pk !== undefined) {
          var bar = document.createElement('div');
          bar.className = 'peerbar';
          var fill = document.createElement('i');
          fill.style.width = r.pk + '%';
          fill.style.background = cssVar(r.pk >= 50 ? '--g-pos-3' : '--g-neg-3');
          bar.appendChild(fill);
          bar.title = 'Supera al ' + r.pk + '% de sus ' + r.pn + ' comunas comparables';
          row.appendChild(bar);
        }
        box.appendChild(row);
      });
      p.appendChild(box);
    });

    p.scrollTop = 0;
  }

  /* ---------- buscador ---------- */
  function buscar(txt) {
    var res = $('results');
    res.textContent = '';
    var q = txt.trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (q.length < 2) { $('q').setAttribute('aria-expanded', 'false'); return; }

    var hits = CORE.comunas.filter(function (c) {
      return c.n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q) >= 0;
    }).slice(0, 12);

    hits.forEach(function (c) {
      var b = document.createElement('button');
      b.setAttribute('data-c', c.c);
      b.setAttribute('role', 'option');
      var s1 = document.createElement('span'); s1.textContent = c.n;
      var s2 = document.createElement('em'); s2.textContent = c.rn;
      b.appendChild(s1); b.appendChild(s2);
      res.appendChild(b);
    });
    $('q').setAttribute('aria-expanded', hits.length ? 'true' : 'false');
  }

  /* ---------- tooltip ---------- */
  var tip = null;
  function moverTip(e, code) {
    if (!tip) tip = $('tip');
    var meta = indexComunas[code];
    if (!meta) return;
    var capa = CORE.layers[capaActiva];
    var zt = brecha(capa.gaps && capa.gaps[code]);

    tip.textContent = '';
    var b = document.createElement('b'); b.textContent = meta.n;
    var s = document.createElement('span');
    var v = capa.values[code];
    s.textContent = fmt(v, capa.unit) + (zt !== null ? '   ' + (zt > 0 ? '+' : '') + zt.toFixed(2) + 'σ' : '   sin dato');
    tip.appendChild(b); tip.appendChild(s);

    tip.classList.add('on');
    var x = e.clientX + 14, y = e.clientY + 14;
    if (x + 240 > window.innerWidth) x = e.clientX - 240;
    if (y + 70 > window.innerHeight) y = e.clientY - 70;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }

  /* ---------- capas ---------- */
  function pintarBotonesCapa() {
    var nav = $('layers');
    nav.textContent = '';

    if (HALLAZGOS && HALLAZGOS.hallazgos && HALLAZGOS.hallazgos.length) {
      var hb = document.createElement('button');
      hb.className = 'layer-btn destacado';
      hb.textContent = 'Hallazgos (' + HALLAZGOS.hallazgos.length + ')';
      hb.setAttribute('data-hallazgos', '1');
      hb.setAttribute('aria-pressed', vistaHallazgos ? 'true' : 'false');
      nav.appendChild(hb);
    }

    CORE.layers.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'layer-btn';
      b.textContent = c.label;
      b.setAttribute('data-i', i);
      b.setAttribute('aria-pressed', (!vistaHallazgos && i === capaActiva) ? 'true' : 'false');
      nav.appendChild(b);
    });
  }

  /* ---------- eventos ---------- */
  function conectar() {
    $('layers').addEventListener('click', function (e) {
      var b = e.target.closest('.layer-btn');
      if (!b) return;

      if (b.getAttribute('data-hallazgos')) {
        vistaHallazgos = true;
        seleccion = null; pares = [];
        marcarSeleccion();
        pintarBotonesCapa();
        panelHallazgos();
        return;
      }

      vistaHallazgos = false;
      capaActiva = parseInt(b.getAttribute('data-i'), 10);
      pintarBotonesCapa();
      aplicarCapa();
      if (seleccion && fichaCache[seleccion]) pintarFicha(fichaCache[seleccion]);
    });

    $('stage').addEventListener('click', function (e) {
      var p = e.target.closest('.comuna');
      if (!p) return;
      abrirComuna(p.getAttribute('data-c'));
    });

    $('stage').addEventListener('mousemove', function (e) {
      var p = e.target.closest('.comuna');
      if (p) moverTip(e, p.getAttribute('data-c'));
      else if (tip) tip.classList.remove('on');
    });
    $('stage').addEventListener('mouseleave', function () {
      if (tip) tip.classList.remove('on');
    });

    $('panel').addEventListener('click', function (e) {
      var mz = e.target.closest('[data-manzana]');
      if (mz) { abrirManzanas(mz.getAttribute('data-manzana')); return; }
      var b = e.target.closest('[data-c]');
      if (!b) return;
      abrirComuna(b.getAttribute('data-c'));
    });

    $('mz-volver').addEventListener('click', cerrarManzanas);
    $('mz-capa').addEventListener('change', function (e) {
      mzCapa = e.target.value;
      pintarManzanas();
    });

    var q = $('q');
    q.addEventListener('input', function () { buscar(q.value); });
    $('results').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      abrirComuna(b.getAttribute('data-c'));
      q.value = '';
      $('results').textContent = '';
      q.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-wrap')) {
        $('results').textContent = '';
        q.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        $('results').textContent = '';
        if (seleccion) { seleccion = null; pares = []; marcarSeleccion(); panelPais(); }
      }
    });
  }

  /* ---------- indicadores economicos ---------- */
  function pintarTicker(d) {
    var t = $('ticker');
    if (!t || !d || !d.indicators) return;
    var hoy = new Date().toISOString().slice(0, 10);
    d.indicators.forEach(function (i) {
      var w = document.createElement('div');
      w.className = 'tk';
      var b = document.createElement('b'); b.textContent = i.code;
      var v = document.createElement('span');
      v.textContent = (i.unit === 'Porcentaje')
        ? i.value.toString().replace('.', ',') + '%'
        : '$' + Math.round(i.value).toLocaleString('es-CL');
      w.appendChild(b); w.appendChild(v);
      // La fecha solo se muestra cuando el dato no es de hoy, que es
      // justamente cuando el lector necesita saberlo.
      if (i.date && i.date !== hoy) {
        var e = document.createElement('em');
        e.textContent = i.date.slice(0, 7);
        w.appendChild(e);
      }
      w.title = i.name + ' · dato del ' + i.date;
      t.appendChild(w);
    });
  }

  /* ---------- arranque ---------- */
  Promise.all([
    fetch('./data/app/mapa.json').then(function (r) { return r.json(); }),
    fetch('./data/app/core.json').then(function (r) { return r.json(); })
  ]).then(function (res) {
    MAPA = res[0];
    CORE = res[1];

    CORE.comunas.forEach(function (c) { indexComunas[c.c] = c; });
    (CORE.catalog || []).forEach(function (r) { catalogo[r.c] = r; });

    pintarMapa();
    pintarBotonesCapa();
    pintarEscala();
    aplicarCapa();
    conectar();

    $('loading').classList.add('off');

    // Opcional: si el workflow diario aun no ha corrido, el sitio funciona igual.
    fetch('./data/app/manzana_capas.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.capas || !d.capas.length) return;
        MZ_CAPAS = d;
        var sel = $('mz-capa');
        d.capas.forEach(function (c) {
          var o = document.createElement('option');
          o.value = c.k;
          o.textContent = c.n;
          sel.appendChild(o);
        });
        mzCapa = d.capas[0].k;
      })
      .catch(function () { /* sin detalle de manzana, el resto funciona igual */ });

    fetch('./data/app/hallazgos.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (h) {
        if (h && h.hallazgos && h.hallazgos.length) { HALLAZGOS = h; pintarBotonesCapa(); }
      })
      .catch(function () { /* el mapa funciona igual sin hallazgos */ });

    fetch('./data/app/indicadores.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(pintarTicker)
      .catch(function () { /* sin ticker, sin drama */ });
  }).catch(function (err) {
    var l = $('loading');
    l.textContent = '';
    var b = document.createElement('b');
    b.textContent = 'No se pudieron cargar los datos';
    var s = document.createElement('span');
    s.textContent = String(err && err.message ? err.message : err);
    l.appendChild(b); l.appendChild(s);
    console.error(err);
  });
})();
