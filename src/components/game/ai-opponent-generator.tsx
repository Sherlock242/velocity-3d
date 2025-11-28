'use client';

import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OpponentProfile } from '@/lib/types';
import { handleGenerateOpponents } from '@/app/actions';

export default function AiOpponentGenerator() {
  const [opponents, setOpponents] = useState<OpponentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onGenerate = async () => {
    setIsLoading(true);
    const generatedOpponents = await handleGenerateOpponents();
    setOpponents(generatedOpponents);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Bot className="mr-2" />
        )}
        Generate AI Opponents
      </Button>

      <div className="space-y-4">
        {opponents.map((opponent, index) => (
          <Card key={index} className="bg-card/80">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                <span>Profile {index + 1}</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">{opponent.skillLevel}</Badge>
                  <Badge variant="outline">{opponent.drivingStyle}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{opponent.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
