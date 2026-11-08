export interface BoardingTrip {
  tripId: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  bus: { busName: string; plateNumber: string };
  totalPassengers: number;
  boarded: number;
}

export interface BoardingPassenger {
  bookingId: string;
  bookingReference: string;
  bookingStatus: string;
  seatId: string;
  seatNumber: string;
  passengerName: string;
  boardingStatus: "NOT_BOARDED" | "BOARDED";
  boardedAt: string | null;
}

export interface BoardingManifest {
  tripId: string;
  totalPassengers: number;
  boarded: number;
  passengers: BoardingPassenger[];
}
