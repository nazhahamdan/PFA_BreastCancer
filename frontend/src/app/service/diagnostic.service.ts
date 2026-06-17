import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DiagnosticDTO {
  id: number;
  type: 'SYMPTOM_DIAGNOSTIC' | 'MAMMOGRAPHY_ANALYSIS' | 'DOCTOR_CONSULTATION';
  status: 'BON' | 'SUSPECT' | 'CANCER';
  date: string;
  details: string;
  symptomes: string;
  recommandation: string;
  imageUrl: string;
  scoreConfidence: number;
  nomMedecin: string;
  resultatMedecin: string;
  notesMedecin: string;
  couleur: string;
}

export interface CalendrierJourDTO {
  date: string;
  couleur: 'BABY_PINK' | 'MEDIUM_PINK' | 'PINK' | 'DARK_RED';
  nombreDiagnostics: number;
  diagnostics: DiagnosticDTO[];
}


@Injectable({
  providedIn: 'root',
})
export class DiagnosticService {
    private api = 'http://localhost:8080/api/diagnostics';

  constructor(private http: HttpClient) {}

  getDiagnostics(patientId: number): Observable<DiagnosticDTO[]> {
    return this.http.get<DiagnosticDTO[]>(`${this.api}/patient/${patientId}`);
  }

  getCalendrier(patientId: number, year: number, month: number): Observable<CalendrierJourDTO[]> {
    return this.http.get<CalendrierJourDTO[]>(
      `${this.api}/patient/${patientId}/calendrier?year=${year}&month=${month}`
    );
  }

  ajouterDiagnostic(patientId: number, dto: Partial<DiagnosticDTO>): Observable<DiagnosticDTO> {
    return this.http.post<DiagnosticDTO>(`${this.api}/patient/${patientId}`, dto);
  }

}
