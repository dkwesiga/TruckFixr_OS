"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type InvestorContact } from "@/lib/types";

export type InvestorFormValues = Omit<
  InvestorContact,
  "id" | "createdDate" | "updatedDate"
>;

type Props = {
  investor?: InvestorContact | null;
  onCancel: () => void;
  onSave: (values: InvestorFormValues) => void;
};

const investorTypes = [
  "Angel",
  "VC",
  "Strategic",
  "Government",
  "Accelerator",
  "Other",
] as const;

const statuses = [
  "Researching",
  "Identified",
  "Outreached",
  "Meeting Booked",
  "Pitch Sent",
  "In Diligence",
  "Term Sheet",
  "Passed",
  "Follow-up Later",
] as const;

function empty(): InvestorFormValues {
  return {
    investorName: "",
    fundName: "",
    investorType: "Angel",
    investmentStage: "",
    email: "",
    linkedIn: "",
    status: "Researching",
    pitchDeckVersion: "",
    lastContactDate: "",
    meetingNotes: "",
    nextAction: "",
    notes: "",
  };
}

function fromInvestor(i: InvestorContact): InvestorFormValues {
  return {
    investorName: i.investorName,
    fundName: i.fundName ?? "",
    investorType: i.investorType,
    investmentStage: i.investmentStage ?? "",
    email: i.email ?? "",
    linkedIn: i.linkedIn ?? "",
    status: i.status,
    pitchDeckVersion: i.pitchDeckVersion ?? "",
    lastContactDate: i.lastContactDate ?? "",
    meetingNotes: i.meetingNotes ?? "",
    nextAction: i.nextAction ?? "",
    notes: i.notes ?? "",
    isDemo: i.isDemo,
  };
}

export function InvestorForm({ investor, onCancel, onSave }: Props) {
  const [values, setValues] = useState<InvestorFormValues>(
    investor ? fromInvestor(investor) : empty()
  );

  function set<K extends keyof InvestorFormValues>(
    key: K,
    value: InvestorFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(values);
  }

  return (
    <form
      className="space-y-4 overflow-y-auto max-h-[70vh] pr-1"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="inv-name">Investor name *</Label>
          <Input
            id="inv-name"
            required
            value={values.investorName}
            onChange={(e) => set("investorName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv-fund">Fund / firm name</Label>
          <Input
            id="inv-fund"
            value={values.fundName}
            onChange={(e) => set("fundName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Investor type *</Label>
          <Select
            value={values.investorType}
            onValueChange={(v) =>
              set("investorType", v as InvestorFormValues["investorType"])
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {investorTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status *</Label>
          <Select
            value={values.status}
            onValueChange={(v) =>
              set("status", v as InvestorFormValues["status"])
            }
          >
            <SelectTrigger className="border-[#e0c0b1] bg-[#f7f9fb]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv-stage">Investment stage</Label>
          <Input
            id="inv-stage"
            placeholder="e.g. Pre-seed, Seed, Series A"
            value={values.investmentStage}
            onChange={(e) => set("investmentStage", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="inv-email">Email</Label>
          <Input
            id="inv-email"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv-linkedin">LinkedIn URL</Label>
          <Input
            id="inv-linkedin"
            type="url"
            placeholder="https://linkedin.com/in/…"
            value={values.linkedIn}
            onChange={(e) => set("linkedIn", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="inv-pitchDeck">Pitch deck version</Label>
          <Input
            id="inv-pitchDeck"
            placeholder="e.g. v2.1"
            value={values.pitchDeckVersion}
            onChange={(e) => set("pitchDeckVersion", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv-lastContact">Last contact date</Label>
          <Input
            id="inv-lastContact"
            type="date"
            value={values.lastContactDate}
            onChange={(e) => set("lastContactDate", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inv-meetingNotes">Meeting notes</Label>
        <Textarea
          id="inv-meetingNotes"
          rows={3}
          value={values.meetingNotes}
          onChange={(e) => set("meetingNotes", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inv-nextAction">Next action</Label>
        <Input
          id="inv-nextAction"
          value={values.nextAction}
          onChange={(e) => set("nextAction", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inv-notes">Notes</Label>
        <Textarea
          id="inv-notes"
          rows={2}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#9d4300] text-white hover:bg-orange-600"
        >
          {investor ? "Save changes" : "Add investor"}
        </Button>
      </div>
    </form>
  );
}
