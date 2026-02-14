'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Truck, ChefHat, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OrderStatusTrackerProps {
  status: string;
  createdAt: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  bakingAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  PENDING: { icon: <Clock className="w-5 h-5" />, label: 'Order Placed', color: 'text-yellow-600' },
  CONFIRMED: { icon: <CheckCircle className="w-5 h-5" />, label: 'Confirmed', color: 'text-blue-600' },
  PREPARING: { icon: <ChefHat className="w-5 h-5" />, label: 'Preparing', color: 'text-purple-600' },
  BAKING: { icon: <Flame className="w-5 h-5" />, label: 'Baking', color: 'text-orange-600' },
  OUT_FOR_DELIVERY: { icon: <Truck className="w-5 h-5" />, label: 'Out for Delivery', color: 'text-green-600' },
  DELIVERED: { icon: <CheckCircle className="w-5 h-5" />, label: 'Delivered', color: 'text-green-700' },  CANCELLED: { icon: <Clock className="w-5 h-5" />, label: 'Order Cancelled', color: 'text-red-600' },};

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function OrderStatusTracker({
  status,
  createdAt,
  confirmedAt,
  preparingAt,
  bakingAt,
  outForDeliveryAt,
  deliveredAt,
}: OrderStatusTrackerProps) {
  const timestampMap: Record<string, Date | undefined> = {
    PENDING: createdAt,
    CONFIRMED: confirmedAt,
    PREPARING: preparingAt,
    BAKING: bakingAt,
    OUT_FOR_DELIVERY: outForDeliveryAt,
    DELIVERED: deliveredAt,
  };

  const currentStatusIndex = STATUS_ORDER.indexOf(status);

  return (
    <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
      <h3 className="font-semibold text-lg mb-4">Order Status</h3>

      <div className="space-y-4">
        {/* Timeline */}
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-200" />

          {STATUS_ORDER.map((s, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const config = STATUS_CONFIG[s];
            const timestamp = timestampMap[s];

            return (
              <div key={s} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-primary border-primary'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                </div>

                {/* Status info */}
                <div
                  className={`pb-4 ${
                    isCurrent ? 'font-semibold text-slate-900' : 'text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={config.color}>{config.icon}</span>
                    <span>{config.label}</span>
                    {isCurrent && (
                      <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>

                  {timestamp && (
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated delivery time */}
      {status !== 'DELIVERED' && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            ⏱️ <strong>Estimated delivery:</strong> 30-45 minutes
          </p>
        </div>
      )}

      {status === 'DELIVERED' && (
        <div className="mt-6 pt-4 border-t border-slate-200 bg-green-50 -m-6 p-6 rounded">
          <p className="text-sm text-green-700 font-medium">
            ✓ Order delivered successfully! Enjoy your meal!
          </p>
        </div>
      )}
    </Card>
  );
}
