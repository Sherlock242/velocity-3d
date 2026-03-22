'use client';

import { Bot } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AiOpponentGenerator() {
  return (
    <div className="space-y-4">
      <Card className="bg-card/80 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Bot className="mr-2" />
            <span>AI Module Disabled</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            The AI engine has been disconnected. Generation of unique driving profiles is currently unavailable.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}