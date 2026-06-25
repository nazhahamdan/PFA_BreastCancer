import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface MammographyResult {
  id: number;
  patientId: number;
  imageUrl: string;
  resultat: 'CANCER' | 'NORMAL'| 'BENIN';
  confidence: number;
  dateAnalyse: string;
  details: string;
  label?: string;           // ← ajouter
  probabilites?: {          // ← ajouter
    'Negative': number;
    'B. Calc': number;
    'B. Mass': number;
    'M. Calc': number;
    'M. Mass': number;
  };
}
@Injectable({
  providedIn: 'root',
})
export class MammographyService {
  private api = 'http://localhost:8080/api/mammography';

  constructor(private http: HttpClient) {}

  analyser(patientId: number, image: File): Observable<MammographyResult> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<MammographyResult>(
      `${this.api}/patient/${patientId}/analyse`, formData
    );
  }

  getHistorique(patientId: number): Observable<MammographyResult[]> {
    return this.http.get<MammographyResult[]>(
      `${this.api}/patient/${patientId}/historique`
    );
  }

}
