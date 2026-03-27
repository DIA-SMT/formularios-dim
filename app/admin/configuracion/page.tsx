"use client";

import { useState, useEffect } from "react";
import { Save, Building2, Mail, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ConfiguracionPage() {
  const [municipio, setMunicipio] = useState("Municipalidad de San Miguel de Tucumán");
  const [provincia, setProvincia] = useState("Provincia de Tucumán");
  const [emailGeneral, setEmailGeneral] = useState("dim@sanmigueldetucuman.gob.ar");
  const [sitioWeb, setSitioWeb] = useState("https://sanmigueldetucuman.gob.ar");
  const [footer, setFooter] = useState(
    "© 2026 Municipalidad de San Miguel de Tucumán — Dirección de Ingresos Municipales"
  );
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifResumen, setNotifResumen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem("dim_config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.municipio) setMunicipio(config.municipio);
        if (config.provincia) setProvincia(config.provincia);
        if (config.emailGeneral) setEmailGeneral(config.emailGeneral);
        if (config.sitioWeb) setSitioWeb(config.sitioWeb);
        if (config.footer) setFooter(config.footer);
        setNotifEmail(config.notifEmail ?? true);
        setNotifResumen(config.notifResumen ?? false);
      } catch (e) {
        console.error("Error loading config", e);
      }
    }
  }, []);

  const handleSave = () => {
    const config = {
      municipio,
      provincia,
      emailGeneral,
      sitioWeb,
      footer,
      notifEmail,
      notifResumen
    };
    localStorage.setItem("dim_config", JSON.stringify(config));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Parámetros generales de la plataforma
        </p>
      </div>

      {/* Institutional data */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Datos institucionales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="municipio" className="text-sm font-medium">
                Nombre del municipio
              </Label>
              <Input
                id="municipio"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="provincia" className="text-sm font-medium">
                Provincia
              </Label>
              <Input
                id="provincia"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emailGeneral" className="text-sm font-medium">
                Email general
              </Label>
              <Input
                id="emailGeneral"
                type="email"
                value={emailGeneral}
                onChange={(e) => setEmailGeneral(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sitioWeb" className="text-sm font-medium">
                Sitio web
              </Label>
              <Input
                id="sitioWeb"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="footer" className="text-sm font-medium">
              Texto del pie de página
            </Label>
            <Textarea
              id="footer"
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Notificaciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Notificar por email al recibir formulario
              </p>
              <p className="text-xs text-muted-foreground">
                Se envía un aviso al área correspondiente
              </p>
            </div>
            <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Resumen semanal de actividad
              </p>
              <p className="text-xs text-muted-foreground">
                Reporte de formularios recibidos y procesados
              </p>
            </div>
            <Switch checked={notifResumen} onCheckedChange={setNotifResumen} />
          </div>
        </CardContent>
      </Card>

      {/* System info */}
      <Card className="border-border bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">
            Información del sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            {[
              { label: "Versión del sistema", value: "MVP v1.0.0" },
              { label: "Formularios activos", value: "2" },
              { label: "Respuestas totales", value: "3" },
              { label: "Última actualización", value: "26/03/2026" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1 border-b border-border last:border-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Guardar configuración
        </Button>
        {saved && (
          <p className="text-sm text-green-700 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
            Configuración guardada
          </p>
        )}
      </div>
    </div>
  );
}
