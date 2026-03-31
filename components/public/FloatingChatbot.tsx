"use client";

import { useState } from "react";
import { MessageCircle, X, Send, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const suggestedQuestions = [
    "¿Cómo inicio un trámite?",
    "¿Qué es la Tasa por Servicios Urbanos?",
    "Requisitos para habilitación comercial",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] print:hidden">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95",
              "bg-primary text-primary-foreground border-2 border-white/20",
              isOpen ? "rotate-90" : "rotate-0"
            )}
          >
            {isOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <MessageCircle className="h-7 w-7" />
            )}
            <span className="sr-only">Abrir asistente virtual</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={16}
          className="w-[380px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200"
        >
          {/* Header */}
          <div className="bg-primary p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-none">Asistente DIM</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">
                    En Línea
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="bg-background flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="flex gap-2 max-w-[85%]">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                    <p className="text-sm leading-relaxed">
                      ¡Hola! Soy el asistente virtual de la Dirección de Ingresos Municipales.
                    </p>
                  </div>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center space-y-3 mx-2 my-4">
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-primary">Próximamente</p>
                    <p className="text-sm text-muted-foreground">
                      Estamos trabajando para brindarte respuestas automáticas sobre trámites y formularios.
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-white font-semibold">
                    Versión 1.0 en desarrollo
                  </Badge>
                </div>

                {/* Example Options */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    ¿Qué podré preguntarle?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        className="text-xs text-left px-3 py-2 rounded-xl border border-border bg-white hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default opacity-80"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Input Area (Disabled) */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex gap-2 items-center bg-white border rounded-xl px-3 py-1 opacity-70 cursor-not-allowed">
                <span className="text-sm text-muted-foreground flex-1 select-none">
                  Escribe un mensaje...
                </span>
                <Button size="icon" variant="ghost" disabled className="h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium">
                Sistemas y Tecnología — DIM
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
