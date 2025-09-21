"use client";
import { ResearchForm } from "../../../components/research/ResearchForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function NewResearchPage() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Submit a Research Topic</CardTitle>
      </CardHeader>
      <CardContent>
        <ResearchForm />
      </CardContent>
    </Card>
  );
}
