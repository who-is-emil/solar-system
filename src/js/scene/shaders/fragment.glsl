varying vec2 vUv;
uniform float time;
varying vec3 vPosition;

// NOISE
float mod289(float x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}

float noise(vec3 p){
    vec3 a=floor(p);
    vec3 d=p-a;
    d=d*d*(3.-2.*d);
    
    vec4 b=a.xxyy+vec4(0.,1.,0.,1.);
    vec4 k1=perm(b.xyxy);
    vec4 k2=perm(k1.xyxy+b.zzww);
    
    vec4 c=k2+a.zzzz;
    vec4 k3=perm(c);
    vec4 k4=perm(c+1.);
    
    vec4 o1=fract(k3*(1./41.));
    vec4 o2=fract(k4*(1./41.));
    
    vec4 o3=o2*d.z+o1*(1.-d.z);
    vec2 o4=o3.yw*d.x+o3.xz*(1.-d.x);
    
    return o4.y*d.y+o4.x*(1.-d.y);
}

void main(){
    // Генерация шума с более плавными переходами
    float n=noise(vPosition*.05+time);// Снижаем масштаб для более гладкого шума
    
    // Применяем smoothstep для плавного перехода
    float smoothedNoise=smoothstep(0.,1.,n);// Гладкий переход от 0 до 1
    
    // Реалистичный желтый цвет Солнца (RGB)
    vec3 sunColor=vec3(1.,1.,.8);
    
    // Умножаем на значение шума для вариации
    gl_FragColor=vec4(sunColor*smoothedNoise,1.);// Применяем шум к цвету
}