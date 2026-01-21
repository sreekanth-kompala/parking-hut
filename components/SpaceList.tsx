import React from "react";
import { ParkingSpace } from "../types";

interface SpaceListProps {
  spaces: ParkingSpace[];
  onSelect?: (space: ParkingSpace) => void;
}

const SpaceList: React.FC<SpaceListProps> = ({ spaces, onSelect }) => {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Spaces
        </h1>
        <p className="text-slate-500 font-medium">
          Browse all available parking spots in our network.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-yellow-300 transition-all cursor-pointer group"
          >
            <div className="h-48 bg-slate-100 relative overflow-hidden">
              <img
                src={
                  space.imageUrl ||
                  `https://picsum.photos/seed/${space.id}/600/300`
                }
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={space.title}
              />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-slate-900 shadow-sm">
                ₹{space.pricing?.car?.hourly || 0}/hr
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 truncate mb-1">
                {space.title}
              </h3>
              <p className="text-sm text-slate-400 mb-6 truncate">
                {space.address}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                  <div className="text-[10px] font-black uppercase text-slate-400">
                    Slots: {space.totalSlots}
                  </div>
                </div>
                {onSelect && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(space);
                    }}
                    className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-yellow-400/20 active:scale-95 transition-all"
                  >
                    BOOK
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {spaces.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <p className="text-slate-400 font-bold">No spaces found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceList;
