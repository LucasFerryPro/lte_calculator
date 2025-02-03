"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const sinrMapping = [
  { snr: 0, efficiency: 0.67, modulation: 2, codingRate: 0.33 },
  { snr: 1.5, efficiency: 1.0, modulation: 2, codingRate: 0.5 },
  { snr: 4.0, efficiency: 1.3, modulation: 2, codingRate: 0.67 },
  { snr: 5.0, efficiency: 1.5, modulation: 2, codingRate: 0.75 },
  { snr: 5.5, efficiency: 1.6, modulation: 2, codingRate: 0.8 },
  { snr: 7.0, efficiency: 2.0, modulation: 4, codingRate: 0.5 },
  { snr: 10.0, efficiency: 2.67, modulation: 4, codingRate: 0.67 },
  { snr: 11.5, efficiency: 3.0, modulation: 4, codingRate: 0.75 },
  { snr: 13.0, efficiency: 3.2, modulation: 4, codingRate: 0.8 },
  { snr: 15.0, efficiency: 4.0, modulation: 6, codingRate: 0.67 },
  { snr: 17.0, efficiency: 4.5, modulation: 6, codingRate: 0.75 },
  { snr: 18.5, efficiency: 4.8, modulation: 6, codingRate: 0.8 },
  { snr: 20.0, efficiency: 5.33, modulation: 8, codingRate: 0.67 },
  { snr: 22.0, efficiency: 6.0, modulation: 8, codingRate: 0.75 },
  { snr: 24.0, efficiency: 6.4, modulation: 8, codingRate: 0.8 },
  { snr: 27.0, efficiency: 7.0, modulation: 8, codingRate: 0.88 },
]

const bandwidthOptions = [
  { bw: 1.4, subcarriers: 72 },
  { bw: 3, subcarriers: 180 },
  { bw: 5, subcarriers: 300 },
  { bw: 10, subcarriers: 600 },
  { bw: 15, subcarriers: 1000 },
  { bw: 20, subcarriers: 1200 },
];

export default function Home() {
  const [bandwidth, setBandwidth] = useState(10);
  const [subcarriers, setSubcarriers] = useState(600);
  const [frequency, setFrequency] = useState(1800);
  const [distance, setDistance] = useState(1);
  const [txPower, setTxPower] = useState(43);
  const [cyclicPrefix, setCyclicPrefix] = useState(false);
  const noiseInterference = -110;
  const qualityThreshold = -100;

  const handleBandwidthChange = (value: any) => {
    const selected = bandwidthOptions.find((option) => option.bw === Number(value));
    if (selected) {
      setBandwidth(selected.bw);
      setSubcarriers(selected.subcarriers);
    }
  };

  const calculateThroughput = () => {
    const pathLoss = 20 * Math.log10(distance) + 20 * Math.log10(frequency) + 32.45;
    const receivedPower = txPower - pathLoss;
    const sinr = receivedPower - noiseInterference;

    if (sinr < qualityThreshold) return 0;

    const closestSinr = sinrMapping.reduce((prev, curr) =>
      Math.abs(curr.snr - sinr) < Math.abs(prev.snr - sinr) ? curr : prev
    );

    const modulation = closestSinr.modulation;

    // Définition des symboles OFDM par slot (6 en mode étendu, 7 en mode normal)
    const symbolsPerSlot = cyclicPrefix ? 6 : 7;
  
    // Nombre de slots par seconde (toujours 2000 en LTE)
    const slotsPerSecond = 2000;

    const codingRate = closestSinr.codingRate;
  
    // Calcul du débit total (bps)
    const dataRate = subcarriers * modulation * symbolsPerSlot * slotsPerSecond;

    const usefulDataRate = dataRate * codingRate;

    return {
      throughput: (usefulDataRate * 1e-6).toFixed(2), // Conversion en Mbps
      dataRate: (dataRate * 1e-6).toFixed(2),
      codingRate: codingRate,
      subcarriers: subcarriers,
      modulation: modulation,
      symbolsPerSlot: symbolsPerSlot,
      slotsPerSecond: slotsPerSecond,
      sinr: sinr,

    };
  };

  const result = calculateThroughput();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-96">
        <CardContent className="p-4 space-y-4">
          <CardTitle className="text-lg font-semibold">LTE Throughput Calculator</CardTitle>
          <div className="space-y-2">
          <label>Bandwidth (MHz):</label>
            <RadioGroup value={bandwidth.toString()} onValueChange={handleBandwidthChange}>
              {bandwidthOptions.map((option) => (
                <div key={option.bw} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.bw.toString()} />
                  <label>{option.bw} MHz</label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <label>Frequency (MHz):</label>
            <Input type="number" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2">
            <label>Extended Cyclic Prefix</label>
            <Checkbox checked={cyclicPrefix} onCheckedChange={(checked) => setCyclicPrefix(checked === true)} />
          </div>
          <div className="space-y-2">
            <label>Distance (km):</label>
            <Input type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <label>Transmission Power (dBm):</label>
            <Input type="number" value={txPower} onChange={(e) => setTxPower(Number(e.target.value))} />
          </div>

          <p className="text-lg font-semibold">Throughput: {result.throughput} Mbps</p>
          <p>Coding Rate: {result.codingRate}</p>
          <p>dataRate {result.dataRate} mbps</p>
          <p>subcarriers {result.subcarriers}</p>
          <p>modulation {result.modulation}</p>
          <p>symbolsPerSlot {result.symbolsPerSlot}</p>
          <p>slotsPerSecond {result.slotsPerSecond}</p>
          <p>sinr {result.sinr}</p>
        </CardContent>
      </Card>
    </div>
  );
}
